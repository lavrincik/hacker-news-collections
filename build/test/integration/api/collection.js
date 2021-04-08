"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const joi_1 = __importDefault(require("joi"));
const data_1 = require("../../utils/data");
const client_1 = require("../../utils/client");
describe('/collections', function () {
    describe('GET /collections', function () {
        it('should return collections by user id', async function () {
            const response = await client_1.authenticatedClient.get(`collections`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.array().items(joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                name: joi_1.default.string()
                    .required()
            }));
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            const userCollections = data_1.collections.filter(c => c.user.id === data_1.users[0].id);
            for (const collection of userCollections) {
                const collectionResponse = value.find((c) => c.id === collection.id);
                chai_1.expect(collectionResponse, 'collection from response').to.not.be.undefined;
                chai_1.expect(collectionResponse.name).to.be.equal(collection.name);
            }
        });
    });
    describe('GET /collections/:id', function () {
        it('should return collection by id', async function () {
            const collection = {
                id: data_1.collections[0].id,
                name: data_1.collections[0].name
            };
            const response = await client_1.authenticatedClient.get(`collections/${collection.id}`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                name: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            chai_1.expect(value).to.be.deep.equal(collection);
        });
        it('should return collection not found (wrong user)', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClientSecondUser
                .get(`collections/${collectionId}`);
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
    });
    describe('POST /collections', function () {
        it('should create new collection', async function () {
            const collectionName = 'newCollection';
            const response = await client_1.authenticatedClient.post(`collections`, {
                json: {
                    name: collectionName
                }
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(201);
            const schema = joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                name: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            chai_1.expect(value.name).to.be.equal(collectionName);
        });
    });
    describe('DELETE /collections/:id', function () {
        it('should delete collection by id', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClient.delete(`collections/${collectionId}`);
            chai_1.expect(response.statusCode, 'status code').to.equal(204);
        });
        it('should return collection not found (wrong user)', async function () {
            const collectionId = data_1.collections[0].id;
            const response = await client_1.authenticatedClientSecondUser
                .delete(`collections/${collectionId}`);
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
    });
    describe('PUT /collections/:id', function () {
        it('should update collection', async function () {
            const collection = data_1.collections[0];
            const updatedCollection = {
                name: `updated${collection.name}`
            };
            const response = await client_1.authenticatedClient.put(`collections/${collection.id}`, {
                json: updatedCollection
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.object({
                id: joi_1.default.number()
                    .required(),
                name: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            chai_1.expect(value.id).to.be.equal(collection.id);
            chai_1.expect(value.name).to.be.equal(updatedCollection.name);
        });
        it('should return collection not found (wrong user)', async function () {
            const collection = data_1.collections[0];
            const updatedCollection = {
                name: `updated${collection.name}`
            };
            const response = await client_1.authenticatedClientSecondUser.put(`collections/${collection.id}`, {
                json: updatedCollection
            });
            chai_1.expect(response.statusCode, 'status code').to.equal(404);
            chai_1.expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        });
    });
});
//# sourceMappingURL=collection.js.map