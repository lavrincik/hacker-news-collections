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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
describe('services - auth', function () {
    describe('createUser()', function () {
        it('should create new user', async function () {
            const mUser = new user_1.User();
            const userRepository = sinon_1.default.createStubInstance(typeorm_1.Repository);
            userRepository.save.withArgs(sinon_1.default.match(mUser)).resolves(mUser);
            const typeormStub = {
                getRepository: sinon_1.default.stub().returns(userRepository)
            };
            const MAuthService = proxyquire_1.default('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService = new MAuthService();
            const user = await authService.createUser();
            chai_1.expect(userRepository.save).to.be.calledWithMatch(mUser);
            chai_1.expect(user).to.equal(mUser);
        });
    });
    describe('userExist()', function () {
        it('should verify user exists', async function () {
            const mUser = new user_1.User();
            const findOptions = {
                where: {
                    id: 1
                }
            };
            const userRepository = sinon_1.default.createStubInstance(typeorm_1.Repository);
            userRepository.findOne.withArgs(sinon_1.default.match(findOptions)).resolves(mUser);
            const typeormStub = {
                getRepository: sinon_1.default.stub().returns(userRepository)
            };
            const MAuthService = proxyquire_1.default('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService = new MAuthService();
            const userExists = await authService.userExist(1);
            chai_1.expect(userRepository.findOne).to.be.calledWithMatch(findOptions);
            chai_1.expect(userExists).to.be.true;
        });
        it("should verify user doesn't exist", async function () {
            const findOptions = {
                where: {
                    id: 1
                }
            };
            const userRepository = sinon_1.default.createStubInstance(typeorm_1.Repository);
            userRepository.findOne.withArgs(sinon_1.default.match(findOptions)).resolves(undefined);
            const typeormStub = {
                getRepository: sinon_1.default.stub().returns(userRepository)
            };
            const MAuthService = proxyquire_1.default('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService = new MAuthService();
            const userExists = await authService.userExist(1);
            chai_1.expect(userRepository.findOne).to.be.calledWithMatch(findOptions);
            chai_1.expect(userExists).to.be.false;
        });
    });
    describe('createToken()', function () {
        it('should create token', function () {
            const mConfig = {
                jwt: {
                    secret: 'secret',
                    expiresIn: 60 * 60
                }
            };
            const MAuthService = proxyquire_1.default('../../../src/services/auth.ts', {
                '../configs': mConfig
            }).default;
            const authService = new MAuthService();
            const userId = 1;
            const token = authService.createToken(userId);
            const decodedToken = jsonwebtoken_1.default.verify(token, mConfig.jwt.secret, {
                ignoreExpiration: true
            });
            chai_1.expect(decodedToken).to.have.deep.property('user', { id: userId });
            chai_1.expect(decodedToken).to.have.property('iat').that.is.a('number');
            chai_1.expect(decodedToken).to.have.property('exp').that.is.a('number');
            chai_1.expect(decodedToken.exp - decodedToken.iat, 'token expiration').to.equal(mConfig.jwt.expiresIn);
        });
    });
});
//# sourceMappingURL=auth.js.map