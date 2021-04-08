"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = __importDefault(require("sinon"));
const typeorm_1 = require("typeorm");
const user_1 = require("../../../src/entities/user");
const chai_1 = require("chai");
const proxyquire_1 = __importDefault(require("proxyquire"));
const collection_1 = require("../../../src/entities/collection");
describe('services - collection', function () {
    describe('createCollection()', function () {
        it('should create new collection', async function () {
            const mUser = new user_1.User();
            mUser.id = 1;
            const findOptions = {
                where: { id: mUser.id }
            };
            const mCollection = new collection_1.Collection();
            mCollection.name = 'collection';
            mCollection.user = mUser;
            const manager = sinon_1.default.createStubInstance(typeorm_1.EntityManager);
            manager.findOneOrFail.withArgs('User', sinon_1.default.match(findOptions)).resolves(mUser);
            manager.save.withArgs(collection_1.Collection, sinon_1.default.match(mCollection)).resolves(mCollection);
            const typeormStub = {
                getManager: sinon_1.default.stub().returns(manager)
            };
            const MCollectionService = proxyquire_1.default('../../../src/services/collection.ts', {
                typeorm: typeormStub
            }).default;
            const collectionService = new MCollectionService();
            const collection = await collectionService.createCollection(mCollection.name, mUser.id);
            chai_1.expect(manager.findOneOrFail).to.be.calledWithMatch(user_1.User, findOptions);
            chai_1.expect(manager.save).to.be.calledWithMatch(collection_1.Collection, mCollection);
            chai_1.expect(collection).to.equal(mCollection);
        });
    });
});
//# sourceMappingURL=collection.js.map