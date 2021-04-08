import { expect } from 'chai';
import Joi from 'joi';
import { collections, comments, stories } from '../../utils/data';
import { authenticatedClient, authenticatedClientSecondUser } from '../../utils/client';
import { Comment } from '../../../src/entities/comment';

describe('/collections/:collectionId/stories/:storyId/comments', function() {
    describe('GET /collections/:collectionId/stories/:storyId/comments', function() {
        it('should return comments by collection id and story id', async function() {
            const collectionId = collections[0].id;
            const storyId = stories[0].id;
            const response = await authenticatedClient
                .get(`collections/${collectionId}/stories/${storyId}/comments`);
            
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

                    text: Joi.string()
                        .allow(null)
                        .allow('')
                        .required()
                })
            );
            
            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;

            const storyComments = comments.filter(c => c.story.id === storyId);
            for (const comment of storyComments) {
                const commentResponse = value.find((c: Comment) => c.id === comment.id);
                expect(commentResponse, 'comment from response').to.not.be.undefined;
                expect(commentResponse.author).to.be.equal(comment.author);
                expect(commentResponse.time).to.be.equal(comment.time);
                expect(commentResponse.text).to.be.equal(comment.text);
            }
        })

        it('should return collection not found (wrong user)', async function() {
            const collectionId = collections[0].id;
            const storyId = stories[0].id;
            const response = await authenticatedClientSecondUser
                .get(`collections/${collectionId}/stories/${storyId}/comments`);

            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Collection not found.');
        })

        it('should return story id must be number', async function() {
            const collectionId = collections[0].id;
            const response = await authenticatedClient
                .get(`collections/${collectionId}/stories/a/comments`);

            expect(response.statusCode, 'status code').to.equal(400);
            expect(response.body).to.be.a('string').that.is.equal('Story id must be a number.');
        })

        it('should return story is not from collection', async function() {
            const collectionId = collections[1].id;
            const story = stories.find(s => {
                const c = s.collections.find(c => c.id === collectionId);
                return c === undefined;
            });

            if (!story) {
                throw Error('Story not found');
            }

            const response = await authenticatedClient
                .get(`collections/${collectionId}/stories/${story.id}/comments`);
                
            expect(response.statusCode, 'status code').to.equal(404);
            expect(response.body).to.be.a('string').that.is.equal('Story is not a part of the collection.');
        })
    })
})