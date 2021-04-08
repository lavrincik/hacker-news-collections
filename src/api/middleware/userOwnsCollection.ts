import Router from "@koa/router";
import { ParameterizedContext, Next } from "koa";
import CollectionService from "../../services/collection";

export default async function userOwnsCollection(
    ctx: ParameterizedContext<any, Router.RouterParamContext<any, {}>, any>, 
    next: Next) {
        const collectionId: number = parseInt(ctx.params.collectionId);
        const collectionService = new CollectionService();
        const userOwnsCollection = await collectionService.isCollectionOwnedByUser(collectionId, ctx.state.userId);
        if (!userOwnsCollection) {
            ctx.status = 404;
            return ctx.body = 'Collection not found.';
        }

        await next();
}