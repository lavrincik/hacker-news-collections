import sinon from "sinon"
import { EntityManager, Repository, SelectQueryBuilder, getRepository, getManager } from 'typeorm';
import { User } from "../../../src/entities/user"
import { expect } from 'chai';
import proxyquire from "proxyquire"; 
import { Collection } from '../../../src/entities/collection';
import CollectionService from '../../../src/services/collection';
import StoryService from '../../../src/services/story';
import { Story } from '../../../src/entities/story';
import { Comment } from '../../../src/entities/comment';

describe('services - collection', function() {
    describe('createCollection()', function() {
        it('should create new collection', async function() {
            const mUser = new User();
            mUser.id = 1;
            const findOptions = {
                where: { id: mUser.id }
            }

            const mCollection = new Collection();
            mCollection.name = 'collection';
            mCollection.user = mUser;

            const manager: sinon.SinonStubbedInstance<EntityManager> = sinon.createStubInstance(EntityManager);
            manager.findOneOrFail.withArgs(User, sinon.match(findOptions)).resolves(mUser);
            manager.save.withArgs(Collection, sinon.match(mCollection)).resolves(mCollection);

            const typeormStub = {
                getManager: sinon.stub().returns(manager)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const collection = await collectionService.createCollection(mCollection.name, mUser.id);
            
            expect(manager.findOneOrFail).to.be.calledWith(User, sinon.match(findOptions));
            expect(manager.save).to.be.calledWith(sinon.match(mCollection));
            expect(collection).to.deep.equal(mCollection);
        })
    })

    describe('getCollectionsByUserId()', function() {
        it('should return collections by user id', async function() {
            const mCollections = [
                new Collection(),
                new Collection()
            ];
            mCollections[0].name = 'collection0';
            mCollections[1].name = 'collection1';

            const userId = 1;

            const collectionRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.withArgs(sinon.match.string, sinon.match({ userId })).returnsThis();
            queryBuilder.getMany.resolves(mCollections);
            collectionRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Collection>);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const collections = await collectionService.getCollectionsByUserId(userId);
            
            expect(collections).to.deep.equal(mCollections);
        })
    })

    describe('getCollectionById()', function() {
        it('should return collection by id', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';

            const findOptions = {
                where: { id: mCollection.id }
            }

            const collectionRepository = sinon.createStubInstance(Repository);
            collectionRepository.findOne.withArgs(sinon.match(findOptions)).resolves(mCollection);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const collection = await collectionService.getCollectionById(mCollection.id);
            
            expect(collectionRepository.findOne).to.be.calledWithMatch(findOptions);
            expect(collection).to.deep.equal(mCollection);
        })
    })

    describe('getCollectionWithUserById()', function() {
        it('should return collection with user by id', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';

            const findOptions = {
                relations: ['user'],
                where: { id: mCollection.id }
            }

            const collectionRepository = sinon.createStubInstance(Repository);
            collectionRepository.findOne.withArgs(sinon.match(findOptions)).resolves(mCollection);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const collection = await collectionService.getCollectionWithUserById(mCollection.id);
            
            expect(collectionRepository.findOne).to.be.calledWithMatch(findOptions);
            expect(collection).to.deep.equal(mCollection);
        })
    })

    describe('isCollectionOwnedByUser()', function() {
        it('should verify that collection is owned by user', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';
            
            const userId = 1;

            const collectionRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.withArgs(sinon.match.string, sinon.match({ userId })).returnsThis();
            queryBuilder.andWhere.withArgs(sinon.match.string, sinon.match({ collectionId: mCollection.id })).returnsThis();
            queryBuilder.getOne.resolves(mCollection);
            collectionRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Collection>);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const isCollectionOwnedByUser = await collectionService.isCollectionOwnedByUser(mCollection.id, userId);
            
            expect(isCollectionOwnedByUser).to.be.true;
        })

        it('should verify that collection is not owned by user', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';
            
            const userId = 1;

            const collectionRepository = sinon.createStubInstance(Repository);
            const queryBuilder = sinon.createStubInstance(SelectQueryBuilder);
            queryBuilder.leftJoin.returnsThis();
            queryBuilder.where.withArgs(sinon.match.string, sinon.match({ userId })).returnsThis();
            queryBuilder.andWhere.withArgs(sinon.match.string, sinon.match({ collectionId: mCollection.id })).returnsThis();
            queryBuilder.getOne.resolves(undefined);
            collectionRepository.createQueryBuilder.returns(queryBuilder as unknown as SelectQueryBuilder<Collection>);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const isCollectionOwnedByUser = await collectionService.isCollectionOwnedByUser(mCollection.id, userId);
            
            expect(isCollectionOwnedByUser).to.be.false;
        })
    })

    describe('removeCollectionById()', function() {
        it('should remove collection by id', async function() {
            const mUser = new User();
            mUser.id = 1;

            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';
            mCollection.user = mUser;

            const idsToUnsucribe: number[] = [];
            const mStories = [
                new Story(),
                new Story()
            ];

            for (let i = 0; i < 2; ++i) {
                mStories[i].id = i;
                idsToUnsucribe.push(i);
                mStories[i].author = `story author ${i}`;
                mStories[i].time = i;
                mStories[i].title = `title ${i}`;
                mStories[i].comments = [];
            }

            const mComments = [
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment(),
                new Comment()
            ]

            for (let i = 0; i < mComments.length; ++i) {
                const id = i + mStories.length;
                mComments[i].id = id;
                idsToUnsucribe.push(id);
                mComments[i].author = `comment author ${i}`;
                mComments[i].time = i;
                mComments[i].text = `comment text ${i}`;
                mStories[i % mStories.length].comments.push(mComments[i]);
            }

            const collectionRepository = sinon.createStubInstance(Repository);
            collectionRepository.findOne.resolves(mCollection);

            const manager: sinon.SinonStubbedInstance<any> = sinon.createStubInstance(EntityManager);
            manager.remove.withArgs(Comment, mComments).resolves(mComments);
            manager.remove.withArgs(Story, mStories).resolves(mStories);
            manager.remove.withArgs(Collection, mCollection).resolves(mCollection);

            sinon.stub(StoryService.prototype, 'getUnusedStoriesWithCommentsInCollection')
                .withArgs(mCollection.id).resolves(mStories);

            const typeormStub = {
                getManager: sinon.stub().returns(manager),
                getRepository: sinon.stub().returns(collectionRepository)
            }

            const hackernewsApi = {
                child: sinon.stub().withArgs(sinon.match.string).returnsThis(),
                off: sinon.stub().returns(undefined)
            }

            const esClient = { default: {
                deleteByQuery: sinon.stub().resolves(undefined)
            }}
        
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub,
                '../loaders/firebase': {
                    hackernewsApi
                },
                '../loaders/elasticsearch': esClient
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const result = await collectionService.removeCollectionById(mCollection.id);

            for (const id of idsToUnsucribe) {
                expect(hackernewsApi.child).to.be.calledWithMatch(`item/${id}`);
            }

            expect(esClient.default.deleteByQuery).to.be.calledTwice;

            expect(manager.remove).to.be.calledWith(Comment, sinon.match.array.contains(mComments));
            expect(manager.remove).to.be.calledWith(Comment, sinon.match.has('length', mComments.length));
            expect(manager.remove).to.be.calledWith(Story, sinon.match.array.deepEquals(mStories));
            expect(manager.remove).to.be.calledWith(Collection, sinon.match(mCollection));

            expect(result).to.be.true;
        })

        it('should not find collection by id', async function() {
            const collectionId = 1;

            const collectionRepository = sinon.createStubInstance(Repository);
            collectionRepository.findOne.resolves(undefined);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository),
                getManager: sinon.fake()
            }

            const esClient = { default: {
                deleteByQuery: sinon.stub().resolves(undefined)
            }}
        
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub,
                '../loaders/elasticsearch': esClient
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const result = await collectionService.removeCollectionById(collectionId);

            expect(result).to.be.false;
        })
    })

    describe('updateCollection()', function() {
        it('should update collection', async function() {
            const mCollection = new Collection();
            mCollection.id = 1;
            mCollection.name = 'collection';

            const updatedCollectionName = 'updatedCollection';

            const collectionRepository = sinon.createStubInstance(Repository);
            collectionRepository.save.withArgs(mCollection).resolves(mCollection);

            const typeormStub = {
                getRepository: sinon.stub().returns(collectionRepository)
            }
            const MCollectionService = proxyquire('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService: CollectionService = new MCollectionService();

            const collection = await collectionService.updateCollection(mCollection, updatedCollectionName);

            expect(collection).to.equal(mCollection);
            expect(collection.name).to.deep.equal(updatedCollectionName);
        })
    })
})