import Router from '@koa/router';
import Joi from 'joi';
import CollectionService from '../services/collection';
import userOwnsCollection from './middleware/userOwnsCollection';
import validateCollectionId from './middleware/validateCollectionId';

export default function collectionRoute(router: Router<any, {}>) {
    const collectionRouter = new Router({
        prefix: '/collections'
    });

    const collectionService = new CollectionService();

    collectionRouter.post('/', 
        async (ctx, _next) => {
            const schema = Joi.object({
                name: Joi.string()
                    .required()
            });
            const { error, value } = schema.validate(ctx.request.body);

            if (error) {
                ctx.status = 400;
                return ctx.body = "Invalid collection.";
            }

            const collection = await collectionService.createCollection(value.name, ctx.state.userId);

            ctx.status = 201;
            ctx.body = {
                id : collection.id,
                name : collection.name
            }
        }
    )

    collectionRouter.get('/', 
        async (ctx, _next) => {
            const collections = await collectionService.getCollectionsByUserId(ctx.state.userId);
            ctx.status = 200;
            ctx.body = collections;
        }
    )

    collectionRouter.get('/search',
        async (ctx, _next) => {
            const content = ctx.query.content;
            if (typeof content !== 'string' || content === '') {
                ctx.status = 400;
                return ctx.body = 'Content query parameter is required and must be non empty string.';
            }

            const storiesAndComments = await collectionService.searchInAllCollections(content, ctx.state.userId);

            ctx.status = 200;
            ctx.body = storiesAndComments;
        }
    )
    
    collectionRouter.get('/:collectionId/search',
        validateCollectionId,
        async (ctx, _next) => {
            const collectionId = parseInt(ctx.params.collectionId);

            const content = ctx.query.content;
            if (typeof content !== 'string' || content === '') {
                ctx.status = 400;
                return ctx.body = 'Content query parameter is required and must be non empty string.';
            }

            const storiesAndComments = await collectionService.searchInCollection(content, ctx.state.userId, collectionId);

            if (storiesAndComments === undefined) {
                ctx.status = 404;
                return ctx.body = 'Collection not found.'
            }

            ctx.status = 200;
            ctx.body = storiesAndComments
        }
    )

    collectionRouter.get('/:collectionId', 
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const collectionId = parseInt(ctx.params.collectionId);

            const collection = await collectionService.getCollectionById(collectionId);

            if (collection === undefined) {
                ctx.status = 404;
                return ctx.body = 'Collection not found.';
            }

            ctx.status = 200;
            ctx.body = collection;
        }
    )

    collectionRouter.delete('/:collectionId',
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const collectionId = parseInt(ctx.params.collectionId);

            const result = await collectionService.removeCollectionById(collectionId);

            if (!result) {
                ctx.status = 404;
                return ctx.body = 'Collection not found.';
            }
            
            ctx.status = 204;
        }
    )

    collectionRouter.put('/:collectionId',
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const collectionId = parseInt(ctx.params.collectionId);

            const schema = Joi.object({
                name: Joi.string()
                    .required()
            });
            const { error, value } = schema.validate(ctx.request.body);

            if (error) {
                ctx.status = 400;
                return ctx.body = "Invalid collection.";
            }

            const collection = await collectionService.getCollectionById(collectionId);

            if (collection === undefined) {
                ctx.status = 404;
                return ctx.body = 'Collection not found.';
            }

            await collectionService.updateCollection(collection, value.name);
            ctx.status = 200;
            ctx.body = collection;
        }
    )

    router.use(collectionRouter.routes(), collectionRouter.allowedMethods());
}