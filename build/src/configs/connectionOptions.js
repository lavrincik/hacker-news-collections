"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const user_1 = require("../entities/user");
const collection_1 = require("../entities/collection");
const story_1 = require("../entities/story");
const comment_1 = require("../entities/comment");
const connectionOptions = {
    type: "postgres",
    host: index_1.default.postgres.host,
    port: index_1.default.postgres.port,
    username: index_1.default.postgres.user,
    password: index_1.default.postgres.password,
    database: index_1.default.postgres.database,
    synchronize: index_1.default.isProduction() ? false : true,
    logging: false,
    entities: [
        collection_1.Collection,
        comment_1.Comment,
        story_1.Story,
        user_1.User
    ],
    migrations: [
        "build/migrations/**/*.js"
    ]
};
exports.default = connectionOptions;
//# sourceMappingURL=connectionOptions.js.map