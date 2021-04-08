"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_1 = require("./firebase");
const koa_1 = __importDefault(require("./koa"));
async function initLoaders(app) {
    firebase_1.loadHackernewsFirebase();
    koa_1.default(app);
}
exports.default = initLoaders;
//# sourceMappingURL=index.js.map