"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const data_1 = require("../../utils/data");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configs_1 = __importDefault(require("../../../src/configs"));
const joi_1 = __importDefault(require("joi"));
const client_1 = require("../../utils/client");
describe('/auth', function () {
    describe('GET /auth', function () {
        it('should return valid token and new user id', async function () {
            const response = await client_1.client.get(`auth`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.object({
                userId: joi_1.default.number()
                    .required(),
                token: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            for (const user of data_1.users) {
                chai_1.expect(value.userId).to.not.equal(user.id);
            }
            const token = jsonwebtoken_1.default.verify(value.token, configs_1.default.jwt.secret, {
                ignoreExpiration: true
            });
            chai_1.expect(token).to.have.deep.property('user', { id: value.userId });
            chai_1.expect(token).to.have.property('iat').that.is.a('number');
            chai_1.expect(token).to.have.property('exp').that.is.a('number');
            chai_1.expect(token.exp - token.iat, 'token expiration').to.equal(configs_1.default.jwt.expiresIn);
        });
    });
    describe('GET /auth/:id', function () {
        it('should return valid token', async function () {
            const userId = data_1.users[0].id;
            const response = await client_1.client.get(`auth/${userId}`);
            chai_1.expect(response.statusCode, 'status code').to.equal(200);
            const schema = joi_1.default.object({
                token: joi_1.default.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            chai_1.expect(error, 'response body schema error').to.be.undefined;
            const token = jsonwebtoken_1.default.verify(value.token, configs_1.default.jwt.secret, {
                ignoreExpiration: true
            });
            chai_1.expect(token).to.have.deep.property('user', { id: userId });
            chai_1.expect(token).to.have.property('iat').that.is.a('number');
            chai_1.expect(token).to.have.property('exp').that.is.a('number');
            chai_1.expect(token.exp - token.iat, 'token expiration').to.equal(configs_1.default.jwt.expiresIn);
        });
    });
});
//# sourceMappingURL=auth.js.map