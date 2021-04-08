import { expect } from 'chai';
import Joi from 'joi';
import { collections, comments, stories, users } from '../../utils/data';
import { Collection } from '../../../src/entities/collection';
import { authenticatedClient, authenticatedClientSecondUser } from '../../utils/client';
import { Story } from '../../../src/entities/story';
import { Comment } from '../../../src/entities/comment';

describe('/collections', function() {
    describe('GET /collections', function() {
        it('should return collections by user id', async function() {
            const response = await authenticatedClient.get(`collections`);

            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
                        .required(),
                    
                    name: Joi.string()
                        .required()
                })
            );

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            const userCollections = collections.filter(c => c.user.id === users[0].id);
            for (const collection of userCollections) {
                const collectionResponse = value.find((c: Collection) => c.id === collection.id);
                expect(collectionResponse, 'collection from response').to.not.be.undefined;
                expect(collectionResponse.name).to.be.equal(collection.name);
            }
        })
    })

    describe('GET /collections/:id', function() {
        it('should return collection by id', async function() {
            const collection = {
                id: collections[0].id,
                name: collections[0].name
            }

            const response = await authenticatedClient.get(`collections/${collection.id}`);

            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.object({
                id: Joi.number()
                    .required(),
                    
                name: Joi.string()
                    .required()
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;
            expect(value).to.be.deep.equal(collection);
        })

        it('should return collection not found (wrong user)', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClientSecondUser
                .get(`collections/${collectionId}`);

            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })
    })

    describe('POST /collections', function() {
        it('should create new collection', async function() {
            const collectionName = 'newCollection';

            const response = await authenticatedClient.post(`collections`, {
                json: {
                    name: collectionName
                }
            });

            expect(response.statusCode, 'status code').to.equal(201);

            const schema = Joi.object({
                id: Joi.number()
                    .required(),
                    
                name: Joi.string()
                    .required()
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;
            expect(value.name).to.be.equal(collectionName);
        })
    })

    describe('DELETE /collections/:id', function() {
        it('should delete collection by id', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClient.delete(`collections/${collectionId}`);

            expect(response.statusCode, 'status code').to.equal(204);
        })

        it('should return collection not found (wrong user)', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClientSecondUser
                .delete(`collections/${collectionId}`);

            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })
    })

    describe('PUT /collections/:id', function() {
        it('should update collection', async function() {
            const collection = collections[0];
            const updatedCollection = {
                name: `updated${collection.name}`
            }

            const response = await authenticatedClient.put(`collections/${collection.id}`, {
                json: updatedCollection
            });

            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.object({
                id: Joi.number()
                    .required(),
                    
                name: Joi.string()
                    .required()
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;
            expect(value.id).to.be.equal(collection.id);
            expect(value.name).to.be.equal(updatedCollection.name);
        })

        it('should return collection not found (wrong user)', async function() {
            const collection = collections[0];
            const updatedCollection = {
                name: `updated${collection.name}`
            }

            const response = await authenticatedClientSecondUser.put(`collections/${collection.id}`, {
                json: updatedCollection
            });
            
            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })
    })

    describe('GET /collections/search', function() {
        it('should return stories and collections based on content query param', async function() {
            const content = 'dropbox';

            const response = await authenticatedClient.get(`collections/search`, {
                searchParams: {
                    content
                }
            });

            expect(response.statusCode, 'status code').to.equal(200);

            const storiesSchema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
                        .allow(null)
                        .required(),

                    author: Joi.string()
                        .allow(null)
                        .required(),

                    time: Joi.number()
                        .allow(null)
                        .required(),

                    title: Joi.string()
                        .allow(null)
                        .required()
                })
            );

            const commentsSchema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
                        .required(),

                    author: Joi.string()
                        .allow(null)
                        .required(),

                    time: Joi.number()
                        .allow(null)
                        .required(),

                    text: Joi.string()
                        .allow(null)
                        .allow('')
                        .required()
                })
            );

            const schema = Joi.object({
                stories: storiesSchema
                    .required(),
                    
                comments: commentsSchema
                    .required()
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            const regex = /dropbox/ig;
            for (const story of value.stories) {
                const conntentIndex = story.title.search(regex);
                expect(conntentIndex).to.not.be.equal(-1);
            }
            for (const comment of value.comments) {
                const conntentIndex = comment.text.search(regex);
                expect(conntentIndex).to.not.be.equal(-1);
            }
        })

        it('should return content query param is required', async function() {
            const response = await authenticatedClientSecondUser.get(`collections/search`);

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is
                .equal('Content query parameter is required and must be non empty string.');
        })

        it('should return invalid content query param (empty string)', async function() {
            const content = '';

            const response = await authenticatedClientSecondUser.get(`collections/search`, {
                searchParams: {
                    content
                }
            });

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is
                .equal('Content query parameter is required and must be non empty string.');
        })
    })

    describe('GET /collections/:collectionId/search', function() {
        it('should return stories and collections based on content query param and collection id', async function() {
            const content = 'dropbox';
            const collection = collections[0];

            const response = await authenticatedClient.get(`collections/${collection.id}/search`, {
                searchParams: {
                    content
                }
            });

            expect(response.statusCode, 'status code').to.equal(200);

            const storiesSchema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
                        .allow(null)
                        .required(),

                    author: Joi.string()
                        .allow(null)
                        .required(),

                    time: Joi.number()
                        .allow(null)
                        .required(),

                    title: Joi.string()
                        .allow(null)
                        .required()
                })
            );

            const commentsSchema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
                        .required(),

                    author: Joi.string()
                        .allow(null)
                        .required(),

                    time: Joi.number()
                        .allow(null)
                        .required(),

                    text: Joi.string()
                        .allow(null)
                        .allow('')
                        .required()
                })
            );

            const schema = Joi.object({
                stories: storiesSchema
                    .required(),
                    
                comments: commentsSchema
                    .required()
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            const regex = /dropbox/ig;
            for (const story of value.stories) {
                const conntentIndex = story.title.search(regex);
                expect(conntentIndex).to.not.be.equal(-1);
            }
            for (const comment of value.comments) {
                const conntentIndex = comment.text.search(regex);
                expect(conntentIndex).to.not.be.equal(-1);
            }
        })

        it('should return collection not found (wrong user)', async function() {
            const content = 'dropbox';
            const collection = collections[0];

            const response = await authenticatedClientSecondUser.get(`collections/${collection.id}/search`, {
                searchParams: {
                    content
                }
            });
            
            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })

        it('should return content query param is required', async function() {
            const collection = collections[0];

            const response = await authenticatedClientSecondUser.get(`collections/${collection.id}/search`);

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is
                .equal('Content query parameter is required and must be non empty string.');
        })

        it('should return invalid content query param (empty string)', async function() {
            const content = '';
            const collection = collections[0];

            const response = await authenticatedClientSecondUser.get(`collections/${collection.id}/search`, {
                searchParams: {
                    content
                }
            });

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is
                .equal('Content query parameter is required and must be non empty string.');
        })
    })
})