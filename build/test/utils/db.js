"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearDb = exports.seedDb = void 0;
const typeorm_1 = require("typeorm");
const collection_1 = require("../../src/entities/collection");
const user_1 = require("../../src/entities/user");
const story_1 = require("../../src/entities/story");
const comment_1 = require("../../src/entities/comment");
const data_1 = require("./data");
async function seedDb() {
    const manager = typeorm_1.getManager();
    await manager.save(user_1.User, data_1.users);
    await manager.save(collection_1.Collection, data_1.collections);
    await manager.save(story_1.Story, data_1.stories);
    await manager.save(comment_1.Comment, data_1.comments);
}
exports.seedDb = seedDb;
async function clearDb() {
    const entities = typeorm_1.getConnection().entityMetadatas;
    const manager = typeorm_1.getManager();
    for (const entity of entities) {
        await manager.query(`TRUNCATE "${entity.tableName}" CASCADE`);
    }
}
exports.clearDb = clearDb;
;
//# sourceMappingURL=db.js.map