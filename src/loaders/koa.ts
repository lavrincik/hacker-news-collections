import cors from '@koa/cors';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import jwt from 'koa-jwt';
import router from '../api';
import config from '../configs';

export default function(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
    app.use(bodyParser());
    app.use(cors());

    app.use(async (ctx, next) => {
        try {
            return await next();
        } catch (err) {
            if (401 == err.status) {
                ctx.status = 401;
                ctx.body = 'Protected resource, use Authorization header to get access\n';
            } else {
                throw err;
            }
        }
    });
      
    const publicPath: string | RegExp | (string | RegExp)[] = [/^\/auth/];
    app.use(jwt({ secret: config.jwt.secret }).unless({ path: publicPath }));

    app.use(async (ctx, next) => {
        if (ctx.state.user) {
            ctx.state.token = ctx.state.user;
            ctx.state.userId = parseInt(ctx.state.user.user?.id);
        }
        await next();
    });

    app.use(router.routes());
    app.use(router.allowedMethods());
}
