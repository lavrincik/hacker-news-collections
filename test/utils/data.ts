import { Collection } from "../../src/entities/collection";
import { Comment } from "../../src/entities/comment";
import { Story } from "../../src/entities/story";
import { User } from "../../src/entities/user";

function createUser(): User {
    const user = new User();
    return user;
}

function createCollection(name: string, user: User): Collection {
    const collection = new Collection();
    collection.name = name;
    collection.user = user;
    return collection;
}

const users: User[] = [
    createUser(),
    createUser()
];

const collections: Collection[] = [
    createCollection('collection1', users[0]),
    createCollection('collection2', users[0])
];

const stories: Story[] = [];

const comments: Comment[] = [];

export { users, collections, stories, comments }