"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const joi_1 = __importDefault(require("joi"));
const data_1 = require("../../utils/data");
const client_1 = require("../../utils/client");
describe('/collections/:collectionId/stories/:storyId/comments', function () {
    describe('GET /collections/:collectionId/stories/:storyId/comments', function () {
        it('should return comments by collection id and story id', async function () {
            const collectionId = data_1.collections[0].id;
            const storyId = data_1.stories[0].id;
            const response = await client_1.authenticatedClient
                .get(`collections/${collectionId}/stories/${storyId}/comments`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.array().items(joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                author: joi_1.default.string()
                    .required(),
                time: joi_1.default.number()
                    .required(),
                text: joi_1.default.string()
                    .allow('')
                    .required()
            }));
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            const storyComments = data_1.comments.filter(c => c.story.id === storyId);
            for (const comment of storyComments) {
                const commentResponse = value.find((c) => c.id === comment.id);
                chai_1.expect(commentResponse, 'comment from response').to.not.be.undefined;
                chai_1.expect(commentResponse.author).to.be.equal(comment.author);
                chai_1.expect(commentResponse.time).to.be.equal(comment.time);
                chai_1.expect(commentResponse.text).to.be.equal(comment.text);
            }
        });
        it('should return collection not found (wrong user)', async function () {
            const collectionId = data_1.collections[0].id;
            const storyId = data_1.stories[0].id;
            const response = await client_1.authenticatedClientSecondUser
                .get(`collections/${collectionId}/stories/${storyId}/comments`);
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
        it('should return story id must be number', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClient
                .get(`collections/${collectionId}/stories/a/comments`);
            chai_1.expect(response.statusCode, 'status code').to.equal(400);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Story id must be a number.');
        });
        it('should return story is not from collection', async function () {
            const collectionId = data_1.collections[1].id;
            const story = data_1.stories.find(s => {
                const c = s.collections.find(c => c.id === collectionId);
                return c === undefined;
            });
            if (!story) {
                throw Error('Story not found');
            }
            const response = await client_1.authenticatedClient
                .get(`collections/${collectionId}/stories/${story.id}/comments`);
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Story is not a part of the collection.');
        });
    });
});
//# sourceMappingURL=comment.js.map