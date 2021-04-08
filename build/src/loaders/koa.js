"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("@koa/cors"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const koa_jwt_1 = __importDefault(require("koa-jwt"));
const api_1 = __importDefault(require("../api"));
const configs_1 = __importDefault(require("../configs"));
function default_1(app) {
    app.use(koa_bodyparser_1.default());
    app.use(cors_1.default());
    app.use(async (ctx, next) => {
        try {
            return await next();
        }
        catch (err) {
            if (401 == err.status) {
                ctx.status = 401;
                ctx.body = 'Protected resource, use Authorization header to get access\n';
            }
            else {
                throw err;
            }
        }
    });
    const publicPath = [/^\/auth/];
    app.use(koa_jwt_1.default({ secret: configs_1.default.jwt.secret }).unless({ path: publicPath }));
    app.use(async (ctx, next) => {
        if (ctx.state.user) {
            ctx.state.token = ctx.state.user;
            ctx.state.userId = parseInt(ctx.state.user.user?.id);
        }
        await next();
    });
    app.use(api_1.default.routes());
    app.use(api_1.default.allowedMethods());
}
exports.default = default_1;
//# sourceMappingURL=koa.js.map