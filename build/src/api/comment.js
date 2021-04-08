"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const comment_1 = __importDefault(require("../services/comment"));
const story_1 = __importDefault(require("../services/story"));
const userOwnsCollection_1 = __importDefault(require("./middleware/userOwnsCollection"));
const validateCollectionId_1 = __importDefault(require("./middleware/validateCollectionId"));
function commentRoute(router) {
    const commentRouter = new router_1.default({
        prefix: '/collections/:collectionId/stories/:storyId/comments'
    });
    const commentService = new comment_1.default();
    const storyService = new story_1.default();
    commentRouter.get('/', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const collectionId = parseInt(ctx.params.collectionId);
        const storyId = parseInt(ctx.params.storyId);
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
    });
    router.use(commentRouter.routes(), commentRouter.allowedMethods());
}
exports.default = commentRoute;
//# sourceMappingURL=comment.js.map