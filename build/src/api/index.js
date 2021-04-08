"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const router_1 = __importDefault(require("@koa/router"));
const auth_1 = __importDefault(require("./auth"));
const collection_1 = __importDefault(require("./collection"));
const story_1 = __importDefault(require("./story"));
const comment_1 = __importDefault(require("./comment"));
const router = new router_1.default();
auth_1.default(router);
collection_1.default(router);
story_1.default(router);
comment_1.default(router);
exports.default = router;
//# sourceMappingURL=index.js.map