"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function validateCollectionId(ctx, next) {
    const collectionId = parseInt(ctx.params.collectionId);
    if (isNaN(collectionId)) {
        ctx.status = 400;
        return ctx.body = 'Collection id must be a number.';
    }
    await next();
}
exports.default = validateCollectionId;
//# sourceMappingURL=validateCollectionId.js.map