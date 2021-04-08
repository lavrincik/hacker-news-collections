import { getRepository } from 'typeorm';
import { Collection } from '../entities/collection';
import { hackernewsApi } from "../loaders/firebase";
import { Story } from '../entities/story';
import { Comment } from '../entities/comment';
import elasticsearchClient from '../loaders/elasticsearch';
import CollectionService from './collection';

export default class StoryService {
    public async getStoryWithCollectionsById(storyId: number): Promise<Story | undefined> {
        return await getRepository(Story).findOne({
            where: { id: storyId },
            relations: ['collections']
        });
    }

    public async addStoryToCollection(collectionId: number, storyId: number): Promise<Story | undefined> {
        const collectionService = new CollectionService();
        const collection = await collectionService.getCollectionWithUserById(collectionId);

        if (collection === undefined) {
            return undefined;
        }

        const existingStory = await this.addExistingStory(collection, storyId);
        if (existingStory !== undefined) {
            return existingStory;
        }

        return this.fetchStory(storyId, collection);
    }

    private async addExistingStory(collection: Collection, storyId: number): Promise<Story | undefined> {
        const story = await this.getStoryWithCollectionsById(storyId);

        if (!story) {
            return undefined;
        }
        
        const storyCollection = story.collections.find(c => c.id === collection.id);
        if (storyCollection !== undefined) {
            return story;
        }

        story.collections.push(collection);
        await getRepository(Story).save(story);
        return story;
    }

    private async fetchStory(storyId: number, collection: Collection): Promise<Story | undefined> {
        return new Promise((resolve) => {
            hackernewsApi.child(`item/${storyId}`).on('value', async (snapshot) => {
                const data = snapshot.val();
                if (data.type !== 'story') {
                    hackernewsApi.child(`item/${storyId}`).off();
                    return resolve(undefined);
                }

                const storyRepository = getRepository(Story);
                const existingStory = await storyRepository.findOne({
                    where: { id: data.id }
                });

                let story = new Story();

                if (existingStory) {
                    story = existingStory;
                } else {
                    story.collections = [ collection ];
                }
         
                story.id = data.id;
                story.author = data.by ?? null;
                story.time = data.time ?? null;
                story.title = data.title ?? null;

                await storyRepository.save(story);

                await elasticsearchClient.index({
                    index: 'story',
                    body: {
                        id: story.id,
                        userId: collection.user.id,
                        collectionId: collection.id,
                        author: story.author,
                        time: story.time,
                        title: story.title
                    }
                });
    
                await this.fetchComments(data.kids, collection, story);

                resolve(story);
            });
        });
    }

    private async fetchComments(kids: number[] | undefined, collection: Collection, story: Story): Promise<void> {
        if (kids === undefined) {
            return;
        }

        const commentRepository = getRepository(Comment);
        for (const commentId of kids) {
            hackernewsApi.child(`item/${commentId}`).on('value', async (snapshot) => {
                const data = snapshot.val();
                const comment = new Comment();
                comment.id = data.id;
                comment.story = story;
                comment.author = data.by ?? null;
                comment.time = data.time ?? null;
                comment.text = data.text ?? null;
                await commentRepository.save(comment);

                await elasticsearchClient.index({
                    index: 'comment',
                    body: {
                        id: comment.id,
                        userId: collection.user.id,
                        collectionId: collection.id,
                        storyId: story.id,
                        author: comment.author,
                        time: comment.time,
                        text: comment.text
                    }
                });

                this.fetchComments(data.kids, collection, story);
            });
        }
    }

    public async isStoryFromCollection(storyId: number, collectionId: number): Promise<boolean> {
        const story = await getRepository(Story).createQueryBuilder('story')
            .leftJoin('story.collections', 'collection')
            .where('story.id = :storyId', { storyId })
            .andWhere('collection.id = :collectionId', { collectionId })
            .getOne();
        
        return story !== undefined;
    }

    public async getStoriesByCollectionId(collectionId: number): Promise<Story[]> {
        return await getRepository(Story).createQueryBuilder('story')
            .leftJoin('story.collections', 'collection')
            .where('collection.id = :collectionId', { collectionId })
            .getMany();
    }

    public async getUnusedStoriesWithCommentsInCollection(collectionId: number) : Promise<Story[]> {
        const stories = await getRepository(Story).createQueryBuilder('story')
            .leftJoinAndSelect('story.collections', 'collection')
            .leftJoinAndSelect('story.comments', 'comment')
            .where(qb => {
                const subQuery = qb.subQuery()
                    .select('story.id')
                    .from(Story, 'story')
                    .leftJoin('story.collections', 'collection')
                    .groupBy('story.id')
                    .having('COUNT(story.id) <= 1')
                    .getQuery();
                return 'story.id IN ' + subQuery;
            })
            .andWhere('collection.id = :collectionId', { collectionId })
            .getMany();

        return stories;
    }
}