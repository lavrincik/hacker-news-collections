"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const firebase_1 = require("../loaders/firebase");
const story_1 = __importDefault(require("../services/story"));
class AppEmitter extends events_1.default {
}
const appEmitter = new AppEmitter();
appEmitter.on('remove-collection', async (collectionId) => {
    const storyService = new story_1.default();
    const stories = await storyService.getUnusedStoriesWithCommentsInCollection(collectionId);
    for (const story of stories) {
        firebase_1.hackernewsApi.child(`item/${story.id}`).off();
        for (const comment of story.comments) {
            firebase_1.hackernewsApi.child(`item/${comment.id}`).off();
        }
    }
});
exports.default = appEmitter;
//# sourceMappingURL=index.js.map