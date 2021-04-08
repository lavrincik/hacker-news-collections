import Router from "@koa/router";
import { ParameterizedContext, Next } from "koa";

export default async function validateCollectionId(
    ctx: ParameterizedContext<any, Router.RouterParamContext<any, {}>, any>, 
    next: Next) {
        const collectionId: number = parseInt(ctx.params.collectionId);
        if (isNaN(collectionId)) {
            ctx.status = 400;
            return ctx.body = 'Collection id must be a number.';
        }

        await next();
}