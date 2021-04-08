import Router from "@koa/router";
import AuthService from '../services/auth';

export default function authRoute(router: Router<any, {}>) {
    const authRouter = new Router({
        prefix: '/auth'
    });

    const authService = new AuthService();

    authRouter.get('/', 
        async (ctx, _next) => {
            const user = await authService.createUser();

            const token = authService.createToken(user.id);

            ctx.body = {
                userId: user.id,
                token: token
            };
            ctx.status = 200;
        }
    )

    authRouter.get('/:userId', 
        async (ctx, _next) => {
            const userId: number = parseInt(ctx.params.userId);

            if (isNaN(userId)) {
                ctx.status = 400;
                return ctx.body = "User id must be a number.";
            }

            const userExists = await authService.userExist(userId);
            if(!userExists) {
                ctx.status = 404;
                return ctx.body = "User not found.";
            }

            const token = authService.createToken(userId);

            ctx.status = 200;
            ctx.body = {
                token
            };
        }
    )

    router.use(authRouter.routes(), authRouter.allowedMethods());
}