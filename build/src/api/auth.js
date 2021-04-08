"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const auth_1 = __importDefault(require("../services/auth"));
function authRoute(router) {
    const authRouter = new router_1.default({
        prefix: '/auth'
    });
    const authService = new auth_1.default();
    authRouter.get('/', async (ctx, _next) => {
        const user = await authService.createUser();
        const token = authService.createToken(user.id);
        ctx.body = {
            userId: user.id,
            token: token
        };
        ctx.status = 200;
    });
    authRouter.get('/:userId', async (ctx, _next) => {
        const userId = parseInt(ctx.params.userId);
        if (isNaN(userId)) {
            ctx.status = 400;
            return ctx.body = "User id must be a number.";
        }
        const userExists = await authService.userExist(userId);
        if (!userExists) {
            ctx.status = 404;
            return ctx.body = "User not found.";
        }
        const token = authService.createToken(userId);
        ctx.status = 200;
        ctx.body = {
            token
        };
    });
    router.use(authRouter.routes(), authRouter.allowedMethods());
}
exports.default = authRoute;
//# sourceMappingURL=auth.js.map