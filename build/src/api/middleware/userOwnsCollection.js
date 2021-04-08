"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collection_1 = __importDefault(require("../../services/collection"));
async function userOwnsCollection(ctx, next) {
    const collectionId = parseInt(ctx.params.collectionId);
    const collectionService = new collection_1.default();
    const userOwnsCollection = await collectionService.isCollectionOwnedByUser(collectionId, ctx.state.userId);
    if (!userOwnsCollection) {
        ctx.status = 404;
        return ctx.body = 'Collection not found.';
    }
    await next();
}
exports.default = userOwnsCollection;
//# sourceMappingURL=userOwnsCollection.js.map