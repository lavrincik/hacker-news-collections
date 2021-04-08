import sinon from "sinon"
import { Repository } from 'typeorm';
import { User } from "../../../src/entities/user"
import { expect } from 'chai';
import proxyquire from "proxyquire"; 
import AuthService from '../../../src/services/auth';
import jwt from 'jsonwebtoken';

describe('services - auth', function() {
    describe('createUser()', function() {
        it('should create new user', async function() {
            const mUser = new User();
            const userRepository : sinon.SinonStubbedInstance<Repository<User>> = sinon.createStubInstance(Repository);
            userRepository.save.withArgs(sinon.match(mUser)).resolves(mUser);
            const typeormStub = {
                getRepository: sinon.stub().returns(userRepository)
            }
            const MAuthService = proxyquire('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService: AuthService = new MAuthService();

            const user = await authService.createUser();
            
            expect(userRepository.save).to.be.calledWithMatch(mUser);
            expect(user).to.deep.equal(mUser);
        })
    })

    describe('userExist()', function() {
        it('should verify user exists', async function() {
            const mUser = new User();
            const findOptions = {
                where: {
                    id: 1
                }
            }
            const userRepository : sinon.SinonStubbedInstance<Repository<User>> = sinon.createStubInstance(Repository);
            userRepository.findOne.withArgs(sinon.match(findOptions)).resolves(mUser);
            const typeormStub = {
                getRepository: sinon.stub().returns(userRepository)
            }
            const MAuthService = proxyquire('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService: AuthService = new MAuthService();
            
            const userExists = await authService.userExist(1);

            expect(userRepository.findOne).to.be.calledWithMatch(findOptions);
            expect(userExists).to.be.true;
        })

        it("should verify user doesn't exist", async function() {
            const findOptions = {
                where: {
                    id: 1
                }
            }
            const userRepository : sinon.SinonStubbedInstance<Repository<User>> = sinon.createStubInstance(Repository);
            userRepository.findOne.withArgs(sinon.match(findOptions)).resolves(undefined);
            const typeormStub = {
                getRepository: sinon.stub().returns(userRepository)
            }
            const MAuthService = proxyquire('../../../src/services/auth.ts', {
                typeorm: typeormStub
            }).default;
            const authService: AuthService = new MAuthService();
            
            const userExists = await authService.userExist(1);

            expect(userRepository.findOne).to.be.calledWithMatch(findOptions);
            expect(userExists).to.be.false;
        })
    })

    describe('createToken()', function() {
        it('should create token', async function() {
            const mConfig = { default: {
                jwt : {
                    secret: 'secret',
                    expiresIn: 60 * 60
                }
            }};

            const MAuthService = proxyquire('../../../src/services/auth.ts', {
                '../configs': mConfig
            }).default;
            const authService: AuthService = new MAuthService();
            const userId = 1;

            const token = authService.createToken(userId);

            const decodedToken: any = jwt.verify(token, mConfig.default.jwt.secret, {
                ignoreExpiration: true
            });
            expect(decodedToken).to.have.deep.property('user', { id: userId });
            expect(decodedToken).to.have.property('iat').that.is.a('number');
            expect(decodedToken).to.have.property('exp').that.is.a('number');
            expect(decodedToken.exp - decodedToken.iat, 'token expiration').to.equal(mConfig.default.jwt.expiresIn);
        })
    })
})