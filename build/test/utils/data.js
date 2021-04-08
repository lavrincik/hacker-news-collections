"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.comments = exports.stories = exports.collections = exports.users = void 0;
const collection_1 = require("../../src/entities/collection");
const user_1 = require("../../src/entities/user");
function createUser() {
    const user = new user_1.User();
    return user;
}
function createCollection(name, user) {
    const collection = new collection_1.Collection();
    collection.name = name;
    collection.user = user;
    return collection;
}
const users = [
    createUser(),
    createUser()
];
exports.users = users;
const collections = [
    createCollection('collection1', users[0]),
    createCollection('collection2', users[0])
];
exports.collections = collections;
const stories = [];
exports.stories = stories;
const comments = [];
exports.comments = comments;
//# sourceMappingURL=data.js.map