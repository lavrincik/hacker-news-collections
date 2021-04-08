"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("../entities/user");
const collection_1 = require("../entities/collection");
const index_1 = __importDefault(require("../subscribers/index"));
const comment_1 = require("../entities/comment");
const story_1 = require("../entities/story");
const story_2 = __importDefault(require("./story"));
class CollectionService {
    async createCollection(name, userId) {
        const entityManager = typeorm_1.getManager();
        const user = await entityManager.findOneOrFail(user_1.User, {
            where: { id: userId }
        });
        const collection = new collection_1.Collection();
        collection.name = name;
        collection.user = user;
        await entityManager.save(collection);
        return collection;
    }
    async getCollectionsByUserId(userId) {
        return await typeorm_1.getRepository(collection_1.Collection).createQueryBuilder('collection')
            .leftJoin('collection.user', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
    }
    async getCollectionById(id) {
        return await typeorm_1.getRepository(collection_1.Collection).findOne({
            where: { id }
        });
    }
    async isCollectionOwnedByUser(collectionId, userId) {
        const collection = await typeorm_1.getRepository(collection_1.Collection).createQueryBuilder('collection')
            .leftJoin('collection.user', 'user')
            .where('user.id = :userId', { userId })
            .andWhere('collection.id = :collectionId', { collectionId })
            .getOne();
        return (collection !== undefined);
    }
    async removeCollectionById(collectionId) {
        index_1.default.emit('remove-collection', collectionId);
        const entityManager = typeorm_1.getManager();
        const collection = await entityManager.createQueryBuilder(collection_1.Collection, 'collection')
            .where('collection.id = :collectionId', { collectionId })
            .getOne();
        if (collection === undefined) {
            return false;
        }
        const storyService = new story_2.default();
        const stories = await storyService.getUnusedStoriesWithCommentsInCollection(collectionId);
        const comments = [];
        for (const story of stories) {
            comments.push(...story.comments);
        }
        await entityManager.remove(comment_1.Comment, comments);
        await entityManager.remove(story_1.Story, stories);
        await entityManager.remove(collection_1.Collection, collection);
        return true;
    }
    async updateCollection(collection, name) {
        collection.name = name;
        return await typeorm_1.getRepository(collection_1.Collection).save(collection);
    }
}
exports.default = CollectionService;
//# sourceMappingURL=collection.js.map