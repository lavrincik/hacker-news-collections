import { expect } from 'chai';
import Joi from 'joi';
import { collections, comments, stories } from '../../utils/data';
import { authenticatedClient, authenticatedClientSecondUser } from '../../utils/client';
import { Story } from '../../../src/entities/story';
import { dummyStory } from '../../utils/hackernews';

describe('/collections/:collectionId/stories', function() {
    describe('GET /collections/:collectionId/stories', function() {
        it('should return stories by collection id', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClient.get(`collections/${collectionId}/stories`);

            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.array().items(
                Joi.object({
                    id: Joi.number()
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

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            const collectionStories = stories.filter(s => {
                const c = s.collections.find(c => c.id === collectionId);
                return c !== undefined;
            });
            for (const story of collectionStories) {
                const storyResponse = value.find((s: Story) => s.id === story.id);
                expect(storyResponse, 'story from response').to.not.be.undefined;
                expect(storyResponse.author).to.be.equal(story.author);
                expect(storyResponse.time).to.be.equal(story.time);
                expect(storyResponse.title).to.be.equal(story.title);
            }
        })

        it('should return collection not found (wrong user)', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClientSecondUser
                .get(`collections/${collectionId}/stories`);
            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })
    })

    describe('POST /collections/:collectionId/stories', function() {
        it('should create new story', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: dummyStory.id
                }
            });
            expect(response.statusCode, 'status code').to.equal(201);

            const schema = Joi.object({
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
            });

            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            expect(value.id).to.be.equal(dummyStory.id);
            expect(value.author).to.be.equal(dummyStory.author);
            expect(value.time).to.be.equal(dummyStory.time);
            expect(value.title).to.be.equal(dummyStory.title);
        })

        it('should return collection not found (wrong user)', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClientSecondUser.post(`collections/${collectionId}/stories`, {
                json: {
                    id: dummyStory.id
                }
            });

            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })

        it('should return story is already part of the collection', async function() {
            const story = stories[0];
            const collectionId = story.collections[0].id;
            const response = await authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: story.id
                }
            });

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is.equal('Story is already part of the collection.');
        })

        it('should return invalid story (story id is a comment id)', async function() {
            const commentId = comments[0];
            const collectionId = stories[0].collections[0].id;
            const response = await authenticatedClient.post(`collections/${collectionId}/stories`, {
                json: {
                    id: commentId
                }
            });

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is.equal('Invalid story.');
        })
    })
})