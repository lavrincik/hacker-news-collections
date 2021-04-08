"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const collection_1 = require("../entities/collection");
const firebase_1 = require("../loaders/firebase");
const story_1 = require("../entities/story");
const comment_1 = require("../entities/comment");
class StoryService {
    async getStoryWithCollectionsById(storyId) {
        return await typeorm_1.getRepository(story_1.Story).findOne({
            where: { id: storyId },
            relations: ['collections']
        });
    }
    async addStoryToCollection(collectionId, storyId) {
        const manager = typeorm_1.getManager();
        const collection = await manager.findOne(collection_1.Collection, {
            where: { id: collectionId }
        });
        if (collection === undefined) {
            return undefined;
        }
        const existingStory = await this.addExistingStory(collection, storyId);
        if (existingStory !== undefined) {
            return existingStory;
        }
        return this.fetchStory(storyId, collection);
    }
    async addExistingStory(collection, storyId) {
        const story = await this.getStoryWithCollectionsById(storyId);
        if (!story) {
            return undefined;
        }
        const storyCollection = story.collections.find(c => c.id === collection.id);
        if (storyCollection !== undefined) {
            return story;
        }
        story.collections.push(collection);
        typeorm_1.getRepository(story_1.Story).save(story);
        return story;
    }
    async fetchStory(storyId, collection) {
        return new Promise((resolve) => {
            firebase_1.hackernewsApi.child(`item/${storyId}`).on('value', async (snapshot) => {
                const data = snapshot.val();
                if (data.type !== 'story') {
                    firebase_1.hackernewsApi.child(`item/${storyId}`).off();
                    return resolve(undefined);
                }
                const story = new story_1.Story();
                story.id = data.id;
                story.collections = [collection];
                story.author = data.by ?? null;
                story.time = data.time ?? null;
                story.title = data.title ?? null;
                await typeorm_1.getRepository(story_1.Story).save(story);
                await this.getComments(data.kids, story);
                resolve(story);
            });
        });
    }
    async getComments(kids, story) {
        if (kids === undefined) {
            return;
        }
        const commentRepository = typeorm_1.getRepository(comment_1.Comment);
        for (const commentId of kids) {
            firebase_1.hackernewsApi.child(`item/${commentId}`).on('value', async (snapshot) => {
                const data = snapshot.val();
                const comment = new comment_1.Comment();
                comment.id = data.id;
                comment.story = story;
                comment.author = data.by ?? null;
                comment.time = data.time ?? null;
                comment.text = data.text ?? null;
                await commentRepository.save(comment);
                this.getComments(data.kids, story);
            });
        }
    }
    async isStoryFromCollection(storyId, collectionId) {
        const story = await typeorm_1.getRepository(story_1.Story).createQueryBuilder('story')
            .leftJoin('story.collections', 'collection')
            .where('story.id = :storyId', { storyId })
            .andWhere('collection.id = :collectionId', { collectionId })
            .getOne();
        return story !== undefined;
    }
    async getStoriesByCollectionId(collectionId) {
        return await typeorm_1.getRepository(story_1.Story).createQueryBuilder('story')
            .leftJoin('story.collections', 'collection')
            .where('collection.id = :collectionId', { collectionId })
            .getMany();
    }
    async getUnusedStoriesWithCommentsInCollection(collectionId) {
        return await typeorm_1.getRepository(story_1.Story).createQueryBuilder('story')
            .leftJoin('story.collections', 'collection')
            .leftJoinAndSelect('story.comments', 'comment')
            .andWhere('collection.id = :collectionId', { collectionId })
            .groupBy('story.id')
            .addGroupBy('comment.id')
            .having('COUNT(collection.id) <= 1')
            .getMany();
    }
}
exports.default = StoryService;
//# sourceMappingURL=story.js.map