"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const joi_1 = __importDefault(require("joi"));
const collection_1 = __importDefault(require("../services/collection"));
const userOwnsCollection_1 = __importDefault(require("./middleware/userOwnsCollection"));
const validateCollectionId_1 = __importDefault(require("./middleware/validateCollectionId"));
function collectionRoute(router) {
    const collectionRouter = new router_1.default({
        prefix: '/collections'
    });
    const collectionService = new collection_1.default();
    collectionRouter.post('/', async (ctx, _next) => {
        const schema = joi_1.default.object({
            name: joi_1.default.string()
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
            id: collection.id,
            name: collection.name
        };
    });
    collectionRouter.get('/', async (ctx, _next) => {
        const collections = await collectionService.getCollectionsByUserId(ctx.state.userId);
        ctx.status = 200;
        ctx.body = collections;
    });
    collectionRouter.get('/:collectionId', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const id = parseInt(ctx.params.collectionId);
        const collection = await collectionService.getCollectionById(id);
        if (collection === undefined) {
            ctx.status = 404;
            return ctx.body = 'Collection not found.';
        }
        ctx.status = 200;
        ctx.body = collection;
    });
    collectionRouter.delete('/:collectionId', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const id = parseInt(ctx.params.collectionId);
        const result = await collectionService.removeCollectionById(id);
        if (!result) {
            ctx.status = 404;
            return ctx.body = 'Collection not found.';
        }
        ctx.status = 204;
    });
    collectionRouter.put('/:collectionId', validateCollectionId_1.default, userOwnsCollection_1.default, async (ctx, _next) => {
        const id = parseInt(ctx.params.collectionId);
        const schema = joi_1.default.object({
            name: joi_1.default.string()
                .required()
        });
        const { error, value } = schema.validate(ctx.request.body);
        if (error) {
            ctx.status = 400;
            return ctx.body = "Invalid collection.";
        }
        const collection = await collectionService.getCollectionById(id);
        if (collection === undefined) {
            ctx.status = 404;
            return ctx.body = 'Collection not found.';
        }
        await collectionService.updateCollection(collection, value.name);
        ctx.status = 200;
        ctx.body = collection;
    });
    router.use(collectionRouter.routes(), collectionRouter.allowedMethods());
}
exports.default = collectionRoute;
//# sourceMappingURL=collection.js.map