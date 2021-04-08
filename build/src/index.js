"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const server_1 = __importDefault(require("./server"));
const app = new koa_1.default();
server_1.default(app);
//# sourceMappingURL=index.js.map