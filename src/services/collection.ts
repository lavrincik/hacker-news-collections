import { getManager, getRepository } from 'typeorm';
import { User } from '../entities/user';
import { Collection } from '../entities/collection';
import { Comment } from '../entities/comment';
import { Story } from '../entities/story';
import StoryService from './story';
import { hackernewsApi } from '../loaders/firebase';
import elasticsearchClient from '../loaders/elasticsearch';

export default class CollectionService {
    public async createCollection(name: string, userId: number): Promise<Collection> {
        const entityManager = getManager();
        const user = await entityManager.findOneOrFail(User, {
            where : { id: userId }
        });

        const collection = new Collection();
        collection.name = name;
        collection.user = user;
        await entityManager.save(collection);

        return collection;
    }

    public async getCollectionsByUserId(userId: number): Promise<Collection[]> {
        return await getRepository(Collection).createQueryBuilder('collection')
            .leftJoin('collection.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
    }

    public async getCollectionById(id: number): Promise<Collection | undefined> {
        return await getRepository(Collection).findOne({
            where : { id }
        });
    }

    public async getCollectionWithUserById(collectionId: number): Promise<Collection | undefined> {
        return await getRepository(Collection).findOne({
            relations: ['user'],
            where : { id: collectionId }
        });
    }

    public async isCollectionOwnedByUser(collectionId: number, userId: number): Promise<boolean> {
        const collection = await getRepository(Collection).createQueryBuilder('collection')
            .leftJoin('collection.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('collection.id = :collectionId', { collectionId })
            .getOne();

        return (collection !== undefined);
    }

    public async removeCollectionById(collectionId: number): Promise<boolean> {
        const entityManager = getManager();

        const collection = await this.getCollectionWithUserById(collectionId);

        if (collection === undefined) {
            return false;
        }

        const storyService = new StoryService();
        const stories = await storyService.getUnusedStoriesWithCommentsInCollection(collectionId);

        const comments: Comment[] = [];
        for (const story of stories) {
            comments.push(...story.comments);
        }

        this.unsubscribeFromStoriesAndComments(stories);
        await this.removeStoriesAndCommentsFromEs(collection);
        await entityManager.remove(Comment, comments);
        await entityManager.remove(Story, stories);
        await entityManager.remove(Collection, collection);

        return true;
    }

    private unsubscribeFromStoriesAndComments(stories: Story[]): void {
        for (const story of stories) {
            hackernewsApi.child(`item/${story.id}`).off();
    
            for (const comment of story.comments) {
                hackernewsApi.child(`item/${comment.id}`).off();
            }
        }
    }

    private async removeStoriesAndCommentsFromEs(collection: Collection): Promise<void> {
        await elasticsearchClient.deleteByQuery({
            index: 'story',
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { userId: collection.user.id } },
                            { term: { collectionId: collection.id } }
                        ]
                    }
                }
            }
        });

        await elasticsearchClient.deleteByQuery({
            index: 'comment',
            body: {
                query: {
                    bool: {
                        must: [
                            { term: { userId: collection.user.id } },
                            { term: { collectionId: collection.id } }
                        ]
                    }
                }
            }
        });
    }

    public async updateCollection(collection: Collection, name: string): Promise<Collection> {
        collection.name = name;
        return await getRepository(Collection).save(collection);
    }

    public async searchInCollection(content: string, userId: number, collectionId: number)
        : Promise<{stories: Story[], comments: Comment[] } | undefined> {
        const collection = await this.getCollectionWithUserById(collectionId);

        if (collection === undefined || userId !== collection.user.id) {
            return undefined;
        }

        const stories = await this.searchStories(content, userId, collectionId);
        const comments = await this.searchComments(content, userId, collectionId);

        return {
            stories,
            comments
        }
    }

    public async searchInAllCollections(content: string, userId: number) 
        : Promise<{stories: Story[], comments: Comment[] }> {
        const stories = await this.searchStories(content, userId);
        const comments = await this.searchComments(content, userId);

        return {
            stories,
            comments
        }
    }

    private async searchStories(content: string, userId: number, collectionId?: number): Promise<Story[]> {
        const must: any[] = [
            { term: { userId: userId.toString() } },
            { match: { title: content } }
        ];

        if (collectionId) {
            must.push({ term: { collectionId: collectionId } });
        }

        const { body } = await elasticsearchClient.search({
            index: 'story',
            size: 100,
            body: {
                query: {
                    bool: {
                        must
                    }
                },
                aggs: {
                    unique_ids: {
                        terms: {
                            field: 'id.keyword'
                        }
                    }
                }
            }
        });

        const stories: Story[] = [];
        for (const bucket of body.aggregations.unique_ids.buckets) {
            const storyResponse = body.hits.hits.find((s: any) => {
                return s._source.id === bucket.key;
            });
            const story = new Story();
            story.id = parseInt(storyResponse._source.id);
            story.author = storyResponse._source.author;
            story.time = storyResponse._source.time;
            story.title = storyResponse._source.title;
            stories.push(story);
        }

        return stories;
    }

    private async searchComments(content: string, userId: number, collectionId?: number): Promise<Comment[]> {
        const must: any[] = [
            { term: { userId: userId } },
            { match: { text: content } }
        ];

        if (collectionId) {
            must.push({ term: { collectionId: collectionId } });
        }

        const { body } = await elasticsearchClient.search({
            index: 'comment',
            size: 10000,
            body: {
                query: {
                    bool: {
                        must
                    }
                },
                aggs: {
                    unique_ids: {
                        terms: {
                            field: 'id.keyword',
                            size: 10000
                        }
                    }
                }
            }
        });

        const comments: Comment[] = [];
        for (const bucket of body.aggregations.unique_ids.buckets) {
            const commentResponse = body.hits.hits.find((c: any) => {
                return c._source.id === bucket.key;
            });
            const comment = new Comment();
            comment.id = parseInt(commentResponse._source.id);
            comment.author = commentResponse._source.author;
            comment.time = commentResponse._source.time;
            comment.text = commentResponse._source.text;
            comments.push(comment);
        }

        return comments;
    }
}