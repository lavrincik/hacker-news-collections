import { Story } from '../../src/entities/story';
import { Comment } from "../../src/entities/comment";
import { comments, collections, stories } from "./data";
import { hackernewsApi } from '../../src/loaders/firebase';
import { Collection } from '../../src/entities/collection';

async function fetchDummyStory(): Promise<void> {
    const snapshot = await hackernewsApi.child(`item/${dummyStoryId}`).get();
    if (!snapshot.exists()) {
        throw Error('Hackernews story not found');
    }

    const hackernewsStory = snapshot.val();
    dummyStory.id = hackernewsStory.id;
    dummyStory.collections = [ collections[0] ];
    dummyStory.author = hackernewsStory.by ?? null;
    dummyStory.time = hackernewsStory.time ?? null;
    dummyStory.title = hackernewsStory.title ?? null;
}

async function addStoryToCollection(collection: Collection, storyId: number): Promise<Story | undefined> {
    const existingStory = await addExistingStory(collection, storyId);
    if (existingStory !== undefined) {
        return existingStory;
    }

    const story = new Story();
    const snapshot = await hackernewsApi.child(`item/${storyId}`).get()
    const data = snapshot.val();
    if (data.type !== 'story') {
        throw new Error('Not a story');
    }

    story.id = data.id;
    story.collections = [ collection ];
    story.author = data.by ?? null;
    story.time = data.time ?? null;
    story.title = data.title ?? null;
    stories.push(story);

    await getComments(data.kids, story);

    return story;
}

async function addExistingStory(collection: Collection, storyId: number): Promise<Story | undefined> {
    const story = stories.find(s => s.id === storyId);

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

async function getComments(kids: number[] | undefined, story: Story): Promise<void> {
    if (kids === undefined) {
        return;
    }

    for (const commentId of kids) {
        const snapshot = await hackernewsApi.child(`item/${commentId}`).get()
        const data = snapshot.val();
        const comment = new Comment();
        comment.id = data.id;
        comment.story = story;
        comment.author = data.by ?? null;
        comment.time = data.time ?? null;
        comment.text = data.text ?? null;
        comments.push(comment);
        getComments(data.kids, story);
    }
}

const exampleStoryId_1 = 8863;
const exampleStoryId_2 = 189;
const exampleCommentId_1 = 15;

const dummyStoryId = 1;
const dummyStory = new Story();

async function fetchHackernews(): Promise<void> {
    await addStoryToCollection(collections[0], exampleStoryId_1);
    await addStoryToCollection(collections[0], exampleStoryId_2);
    await addStoryToCollection(collections[1], exampleStoryId_1);
    await fetchDummyStory();
}

export { fetchHackernews, dummyStory, exampleStoryId_1, exampleStoryId_2, exampleCommentId_1 };