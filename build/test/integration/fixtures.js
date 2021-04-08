"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaGlobalTeardown = exports.mochaGlobalSetup = void 0;
// reflect-metadata shim for TypeORM
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const db_1 = require("../utils/db");
const koa_1 = __importDefault(require("koa"));
const server_1 = __importDefault(require("../../src/server"));
const hackernews_1 = require("../utils/hackernews");
async function mochaGlobalSetup() {
    this.app = new koa_1.default();
    await server_1.default(this.app);
    await db_1.clearDb();
    await hackernews_1.fetchHackernews();
}
exports.mochaGlobalSetup = mochaGlobalSetup;
async function mochaGlobalTeardown() {
    await db_1.clearDb();
    await typeorm_1.getConnection().close();
}
exports.mochaGlobalTeardown = mochaGlobalTeardown;
//# sourceMappingURL=fixtures.js.map