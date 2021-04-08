import Router from "@koa/router";
import CommentService from '../services/comment';
import StoryService from '../services/story';
import userOwnsCollection from "./middleware/userOwnsCollection";
import validateCollectionId from "./middleware/validateCollectionId";

export default function commentRoute(router: Router<any, {}>) {
    const commentRouter = new Router({
        prefix: '/collections/:collectionId/stories/:storyId/comments'
    });

    const commentService = new CommentService();
    const storyService = new StoryService();

    commentRouter.get('/', 
        validateCollectionId,
        userOwnsCollection,
        async (ctx, _next) => {
            const collectionId: number = parseInt(ctx.params.collectionId);
            const storyId: number = parseInt(ctx.params.storyId);
            if (isNaN(storyId)) {
                ctx.status = 400;
                return ctx.body = 'Story id must be a number.';
            }

            if (!await storyService.isStoryFromCollection(storyId, collectionId)) {
                ctx.status = 404;
                return ctx.body = 'Story is not a part of the collection.';
            }

            const comments = await commentService.getCommentsByStoryId(storyId);

            ctx.status = 200;
            ctx.body = comments;
        }
    )

    router.use(commentRouter.routes(), commentRouter.allowedMethods());
}