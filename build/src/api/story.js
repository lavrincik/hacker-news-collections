"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const joi_1 = __importDefault(require("joi"));
const story_1 = __importDefault(require("../services/story"));
const userOwnsCollection_1 = __importDefault(require("./middleware/userOwnsCollection"));
const validateCollectionId_1 = __importDefault(require("./middleware/validateCollectionId"));
function storyRoute(router) {
    const storyRouter = new router_1.default({
        prefix: '/collections/:collectionId/stories'
    });
    const storyService = new story_1.default();
    storyRouter.post('/', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const schema = joi_1.default.object({
            id: joi_1.default.number()
                .required()
        });
        const { error, value } = schema.validate(ctx.request.body);
        if (error) {
            ctx.status = 400;
            return ctx.body = 'Invalid story.';
        }
        const collectionId = parseInt(ctx.params.collectionId);
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
            id: story.id,
            author: story.author,
            title: story.title,
            time: story.time
        };
    });
    storyRouter.get('/', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const collectionId = parseInt(ctx.params.collectionId);
        const stories = await storyService.getStoriesByCollectionId(collectionId);
        ctx.status = 200;
        ctx.body = stories;
    });
    router.use(storyRouter.routes(), storyRouter.allowedMethods());
}
exports.default = storyRoute;
//# sourceMappingURL=story.js.map