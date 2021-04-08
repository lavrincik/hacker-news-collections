import Router from "@koa/router";
import Joi from "joi";
import StoryService from "../services/story";
import userOwnsCollection from "./middleware/userOwnsCollection";
import validateCollectionId from "./middleware/validateCollectionId";

export default function storyRoute(router: Router<any, {}>) {
    const storyRouter = new Router({
        prefix: '/collections/:collectionId/stories'
    });

    const storyService = new StoryService();

    storyRouter.post('/',
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const schema = Joi.object({
                id: Joi.number()
                    .required()
            });
            const { error, value } = schema.validate(ctx.request.body);

            if (error) {
                ctx.status = 400;
                return ctx.body = 'Invalid story.';
            }

            const collectionId: number = parseInt(ctx.params.collectionId);

            const isStoryFromCollection = await storyService.isStoryFromCollection(value.id, collectionId);
            if (isStoryFromCollection) {
                ctx.status = 400;
                return ctx.body = 'Story is already part of the collection.';
            }

            const story = await storyService.addStoryToCollection(collectionId, value.id);

            if (story === undefined) {
                ctx.status = 400;
                return ctx.body = 'Invalid story.';
            }

            ctx.status = 201;
            ctx.body = {
                id : story.id,
                author : story.author,
                title : story.title,
                time: story.time
            }
        }
    )

    storyRouter.get('/',
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const collectionId: number = parseInt(ctx.params.collectionId);
            const stories = await storyService.getStoriesByCollectionId(collectionId)
            ctx.status = 200;
            ctx.body = stories;
        }
    )

    router.use(storyRouter.routes(), storyRouter.allowedMethods());
}