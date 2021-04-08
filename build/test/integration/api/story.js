"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const joi_1 = __importDefault(require("joi"));
const data_1 = require("../../utils/data");
const client_1 = require("../../utils/client");
const hackernews_1 = require("../../utils/hackernews");
describe('/collections/:collectionId/stories', function () {
    describe('GET /collections/:collectionId/stories', function () {
        it('should return stories by collection id', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClient.get(`collections/${collectionId}/stories`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.array().items(joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                author: joi_1.default.string()
                    .required(),
                time: joi_1.default.number()
                    .required(),
                title: joi_1.default.string()
                    .required()
            }));
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            const collectionStories = data_1.stories.filter(s => {
                const c = s.collections.find(c => c.id === collectionId);
                return c !== undefined;
            });
            for (const story of collectionStories) {
                const storyResponse = value.find((s) => s.id === story.id);
                chai_1.expect(storyResponse, 'story from response').to.not.be.undefined;
                chai_1.expect(storyResponse.author).to.be.equal(story.author);
                chai_1.expect(storyResponse.time).to.be.equal(story.time);
                chai_1.expect(storyResponse.title).to.be.equal(story.title);
            }
        });
        it('should return collection not found (wrong user)', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClientSecondUser
                .get(`collections/${collectionId}/stories`);
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
    });
    describe('POST /collections/:collectionId/stories', function () {
        it('should create new story', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: hackernews_1.dummyStory.id
                }
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(201);
            const schema = joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                author: joi_1.default.string()
                    .required(),
                time: joi_1.default.number()
                    .required(),
                title: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            chai_1.expect(value.id).to.be.equal(hackernews_1.dummyStory.id);
            chai_1.expect(value.author).to.be.equal(hackernews_1.dummyStory.author);
            chai_1.expect(value.time).to.be.equal(hackernews_1.dummyStory.time);
            chai_1.expect(value.title).to.be.equal(hackernews_1.dummyStory.title);
        });
        it('should return collection not found (wrong user)', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClientSecondUser.post(`collections/${collectionId}/stories`, {
                json: {
                    id: hackernews_1.dummyStory.id
                }
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
        it('should return story is already part of the collection', async function () {
            const story = data_1.stories[0];
            const collectionId = story.collections[0].id;
            const response = await client_1.authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: story.id
                }
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(400);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Story is already part of the collection.');
        });
        it('should return invalid story (story id is a comment id)', async function () {
            const commentId = data_1.comments[0];
            const collectionId = data_1.stories[0].collections[0].id;
            const response = await client_1.authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: commentId
                }
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(400);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Invalid story.');
        });
    });
});
//# sourceMappingURL=story.js.map