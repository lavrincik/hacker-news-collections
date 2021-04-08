"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dummyStory = exports.fetchHackernews = void 0;
const story_1 = require("../../src/entities/story");
const comment_1 = require("../../src/entities/comment");
const data_1 = require("./data");
const firebase_1 = require("../../src/loaders/firebase");
async function fetchDummyStory() {
    const snapshot = await firebase_1.hackernewsApi.child(`item/${dummyStoryId}`).get();
    if (!snapshot.exists()) {
        throw Error('Hackernews story not found');
    }
    const hackernewsStory = snapshot.val();
    dummyStory.id = hackernewsStory.id;
    dummyStory.collections = [data_1.collections[0]];
    dummyStory.author = hackernewsStory.by ?? null;
    dummyStory.time = hackernewsStory.time ?? null;
    dummyStory.title = hackernewsStory.title ?? null;
}
async function addStoryToCollection(collection, storyId) {
    const existingStory = await addExistingStory(collection, storyId);
    if (existingStory !== undefined) {
        return existingStory;
    }
    const story = new story_1.Story();
    const snapshot = await firebase_1.hackernewsApi.child(`item/${storyId}`).get();
    const data = snapshot.val();
    if (data.type !== 'story') {
        firebase_1.hackernewsApi.child(`item/${storyId}`).off();
        throw new Error('Not a story');
    }
    story.id = data.id;
    story.collections = [collection];
    story.author = data.by ?? null;
    story.time = data.time ?? null;
    story.title = data.title ?? null;
    data_1.stories.push(story);
    await getComments(data.kids, story);
    return story;
}
async function addExistingStory(collection, storyId) {
    const story = data_1.stories.find(s => s.id === storyId);
    if (!story) {
        return undefined;
    }
    const storyCollection = story.collections.find(c => c === collection);
    if (storyCollection !== undefined) {
        throw Error('Story is alrade part of the collection');
    }
    story.collections.push(collection);
    return story;
}
async function getComments(kids, story) {
    if (kids === undefined) {
        return;
    }
    for (const commentId of kids) {
        const snapshot = await firebase_1.hackernewsApi.child(`item/${commentId}`).get();
        const data = snapshot.val();
        const comment = new comment_1.Comment();
        comment.id = data.id;
        comment.story = story;
        comment.author = data.by ?? null;
        comment.time = data.time ?? null;
        comment.text = data.text ?? null;
        data_1.comments.push(comment);
        getComments(data.kids, story);
    }
}
const exampleStoryId_1 = 8863;
const exampleStoryId_2 = 2;
const dummyStoryId = 1;
const dummyStory = new story_1.Story();
exports.dummyStory = dummyStory;
async function fetchHackernews() {
    await addStoryToCollection(data_1.collections[0], exampleStoryId_1);
    await addStoryToCollection(data_1.collections[0], exampleStoryId_2);
    await addStoryToCollection(data_1.collections[1], exampleStoryId_1);
    await fetchDummyStory();
}
exports.fetchHackernews = fetchHackernews;
//# sourceMappingURL=hackernews.js.map