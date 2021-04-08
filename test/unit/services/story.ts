import { Collection } from '../../../src/entities/collection';
import { Story } from '../../../src/entities/story';
import { DeepPartial, Repository, SelectQueryBuilder } from 'typeorm';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import StoryService from '../../../src/services/story';
import { expect } from 'chai';
import { exampleCommentId_1, exampleStoryId_1 } from '../../utils/hackernews';
import { Comment } from '../../../src/entities/comment';
import { loadHackernewsFirebase } from '../../../src/loaders/firebase';
import { User } from '../../../src/entities/user';
import CollectionService from '../../../src/services/collection';

describe('services - story', function() {
    describe('getStoryWithCollectionsById()', function() {
        it('should return stories with collections by id', async function() {
            const mCollections = [
                new Collection(),
                new Collection()
            ];

            for (let i = 0; i < 2; ++i) {
                mCollections[i].id = i;
                mCollections[i].name = `name ${i}`;
            }

            const mStory = new Story();
            mStory.id = 1;
            mStory.author = 'author';
            mStory.time = 0;
            mStory.title = 'title';
            mStory.collections = mCollections;

            const findOptions = {
                where: { id: mStory.id },
                relations: ['collections']
            }

            const storyRepostiroy: sinon.SinonStubbedInstance<Repository<Story>> = sinon.createStubInstance(Repository);
            storyRepostiroy.findOne.withArgs(sinon.match(findOptions)).resolves(mStory);

            const typeormStub = {
                getRepository: sinon.stub().returns(storyRepostiroy)
            }
            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub
            }).default;
            const storyService: StoryService = new MStoryService();

            const story = await storyService.getStoryWithCollectionsById(mStory.id);
            
            expect(story).to.deep.equal(mStory);
        })
    })

    describe('addStoryToCollection()', function() {
        before(function() {
            loadHackernewsFirebase();
        })

        it('should add story to collection and return it', async function() {
            const mUser = new User();
            mUser.id = 1;

            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'name';
            mCollection.user = mUser;

            const mStory: Story = new Story();
            const comments: Comment[] = [];

            sinon.stub(CollectionService.prototype, 'getCollectionWithUserById')
                .withArgs(mCollection.id).resolves(mCollection);

            const storyRepository: sinon.SinonStubbedInstance<Repository<Story>> = sinon.createStubInstance(Repository);
            storyRepository.findOne.withArgs(sinon.match({ where: { id: exampleStoryId_1 } })).resolves(undefined);
            storyRepository.save.callsFake(async (s: DeepPartial<Story>): Promise<DeepPartial<Story> & Story> => {
                s.id ? mStory.id = s.id : undefined;
                mStory.author = s.author ?? null;
                mStory.time = s.time ?? null;
                mStory.title = s.title ?? null;
                mStory.collections = [ mCollection ];
                return mStory;
            });

            const commenRepository: sinon.SinonStubbedInstance<Repository<Comment>> = sinon.createStubInstance(Repository);
            commenRepository.save.callsFake(async (c: DeepPartial<Comment>): Promise<DeepPartial<Comment> & Comment> => {
                const comment = new Comment();
                c.id ? comment.id = c.id : undefined;
                c.story?.id === exampleStoryId_1 ? comment.story = mStory : undefined;
                comment.author = c.author ?? null;
                comment.time = c.time ?? null;
                comment.text = c.text ?? null;
                comments.push(comment);
                return comment;
            });

            const mGetRepository = sinon.stub().callsFake(
                (entityType: typeof Collection | typeof Story | typeof Comment) => {
                    switch(entityType) {
                        case Story:
                            return storyRepository;
                        case Comment:
                            return commenRepository;
                        default:
                            throw Error('getRepository() unkown type');
                    }
            });

            const typeormStub = {
                getRepository: mGetRepository
            }

            const esClient = { default: {
                index: sinon.stub().resolves(undefined)
            }}

            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub,
                '../loaders/elasticsearch': esClient
            }).default;
            const storyService: StoryService = new MStoryService();
            sinon.stub(storyService, 'getStoryWithCollectionsById').withArgs(exampleStoryId_1).resolves(undefined);

            const story = await storyService.addStoryToCollection(mCollection.id, exampleStoryId_1);

            expect(story?.id).to.be.equal(exampleStoryId_1);
            expect(story?.author).to.satisfy((author: any) => {
                return author === null || typeof author === 'string';
            });
            expect(story?.time).to.satisfy((time: any) => {
                return time === null || typeof time === 'number';
            });
            expect(story?.title).to.satisfy((title: any) => {
                return title === null || typeof title === 'string';
            });

            expect(esClient.default.index).to.be.calledWithMatch({
                index: 'story',
                body: {
                    id: mStory.id,
                    userId: mUser.id,
                    collectionId: mCollection.id,
                    author: mStory.author,
                    time: mStory.time,
                    title: mStory.title
                }
            });

            for (const comment of comments) {
                expect(comment.id).to.be.a('number');
                expect(comment?.author).to.satisfy((author: any) => {
                    return author === null || typeof author === 'string';
                });
                expect(comment?.text).to.satisfy((text: any) => {
                    return text === null || typeof text === 'string';
                });
                expect(comment?.time).to.satisfy((time: any) => {
                    return time === null || typeof time === 'number';
                });

                expect(esClient.default.index).to.be.calledWithMatch({
                    index: 'comment',
                    body: {
                        id: comment.id,
                        userId: mUser.id,
                        collectionId: mCollection.id,
                        storyId: mStory.id,
                        author: comment.author,
                        time: comment.time,
                        text: comment.text
                    }
                });
            }
        })

        it('should return undefined (collection does not exist)', async function() {
            const collectionId = 1;

            sinon.stub(CollectionService.prototype, 'getCollectionWithUserById')
                .withArgs(collectionId).resolves(undefined);

            const storyService: StoryService = new StoryService();

            const story = await storyService.addStoryToCollection(collectionId, exampleStoryId_1);

            expect(story).to.be.undefined;
        })

        it('should add existing story to collection and return it', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection 1';

            const mStory: Story = new Story();
            mStory.id = 1;
            mStory.author = 'author';
            mStory.time = 1;
            mStory.title = 'title';
            mStory.collections = [
                new Collection()
            ];
            mStory.collections[0].id = 2;
            mStory.collections[0].name = 'collection 2';

            sinon.stub(CollectionService.prototype, 'getCollectionWithUserById')
                .withArgs(mCollection.id).resolves(mCollection);

            const storyRepository: sinon.SinonStubbedInstance<Repository<Story>> = sinon.createStubInstance(Repository);
            storyRepository.save.withArgs(sinon.match(mStory)).resolves(mStory);

            const mGetRepository = sinon.stub().callsFake(
                (entityType: typeof Collection | typeof Story | typeof Comment) => {
                    switch(entityType) {
                        case Story:
                            return storyRepository;
                        default:
                            throw Error('getRepository() unkown type');
                    }
            });

            const typeormStub = {
                getRepository: mGetRepository
            }
            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub
            }).default;
            const storyService: StoryService = new MStoryService();
            sinon.stub(storyService, 'getStoryWithCollectionsById').withArgs(mStory.id).resolves(mStory);

            const story = await storyService.addStoryToCollection(mCollection.id, mStory.id);

            expect(story?.collections).to.deep.include(mCollection);
            expect(story).to.deep.equal(mStory);
        })

        it('should return story that was in the collection', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection 1';

            const mStory: Story = new Story();
            mStory.id = 1;
            mStory.author = 'author';
            mStory.time = 1;
            mStory.title = 'title';
            mStory.collections = [
                new Collection(),
                mCollection
            ];
            mStory.collections[0].id = 2;
            mStory.collections[0].name = 'collection 2';

            sinon.stub(CollectionService.prototype, 'getCollectionWithUserById')
                .withArgs(mCollection.id).resolves(mCollection);

            const storyService: StoryService = new StoryService();
            sinon.stub(storyService, 'getStoryWithCollectionsById').withArgs(mStory.id).resolves(mStory);

            const story = await storyService.addStoryToCollection(mCollection.id, mStory.id);

            expect(story).to.deep.equal(mStory);
        })

        it('should not add story - story id is a comment id', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'name';

            sinon.stub(CollectionService.prototype, 'getCollectionWithUserById')
                .withArgs(mCollection.id).resolves(mCollection);

            const storyService: StoryService = new StoryService();
            sinon.stub(storyService, 'getStoryWithCollectionsById').withArgs(exampleCommentId_1).resolves(undefined);

            const story = await storyService.addStoryToCollection(mCollection.id, exampleCommentId_1);

            expect(story).to.be.undefined;
        })
    })

    describe('isStoryFromCollection()', function() {
        it('should verify story is from collection', async function() {
            const story = new Story();
            const storyRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.returnsThis();
            queryBuilder.andWhere.returnsThis();
            queryBuilder.getOne.resolves(story);
            storyRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Story>);

            const typeormStub = {
                getRepository: sinon.stub().returns(storyRepository)
            }
            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub
            }).default;
            const storyService: StoryService = new MStoryService();

            const result = await storyService.isStoryFromCollection(0, 0);

            expect(result).to.be.true;
        })
    })

    describe('getStoriesByCollectionId()', function() {
        it('should return stories by collection id', async function() {
            const mStories = [
                new Story(),
                new Story()
            ];

            for (let i = 0; i < 2; ++i) {
                mStories[i].id = i;
                mStories[i].author = `story author ${i}`;
                mStories[i].time = i;
                mStories[i].title = `title ${i}`;
            }

            const storyRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.returnsThis();
            queryBuilder.getMany.resolves(mStories);
            storyRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Story>);

            const typeormStub = {
                getRepository: sinon.stub().returns(storyRepository)
            }
            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub
            }).default;
            const storyService: StoryService = new MStoryService();

            const stories = await storyService.getStoriesByCollectionId(0);

            expect(stories).to.be.equal(mStories);
        })
    })

    describe('getUnusedStoriesWithCommentsInCollection()', function() {
        it('should return unused stories with comments from collection', async function() {
            const mCollection0 = new Collection();
            mCollection0.id = 0;
            mCollection0.name = 'collection 0';

            const mStories = [
                new Story(),
                new Story()
            ];

            for (let i = 0; i < 2; ++i) {
                mStories[i].id = i;
                mStories[i].author = `story author ${i}`;
                mStories[i].time = i;
                mStories[i].title = `title ${i}`;
            }

            mStories[0].collections = [ mCollection0 ];
            mStories[1].collections = [ mCollection0 ];

            const storyRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoinAndSelect.returnsThis();
            queryBuilder.where.returnsThis();
            queryBuilder.andWhere.returnsThis();
            queryBuilder.getMany.resolves(mStories);
            storyRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Story>);

            const typeormStub = {
                getRepository: sinon.stub().returns(storyRepository)
            }
            const MStoryService = proxyquire('../../../src/services/story.ts', {
                typeorm: typeormStub
            }).default;
            const storyService: StoryService = new MStoryService();

            const stories = await storyService.getUnusedStoriesWithCommentsInCollection(mCollection0.id);

            expect(stories).to.be.deep.equal(mStories);
        })
    })
})