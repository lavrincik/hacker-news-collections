import { expect } from 'chai';
import { users } from '../../utils/data';
import jwt from 'jsonwebtoken';
import appConfig from '../../../src/configs';
import Joi from 'joi';
import { client } from '../../utils/client';

describe('/auth', function() {
    describe('GET /auth', function() {
        it('should return valid token and new user id', async function() {
            const response = await client.get(`auth`);
            
            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.object({
                userId: Joi.number()
                    .required(),
                
                token: Joi.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);

            expect(error, 'response body schema error').to.be.undefined;
            
            for (const user of users) {
                expect(value.userId).to.not.equal(user.id);
            }

            const token: any = jwt.verify(value.token, appConfig.jwt.secret, {
                ignoreExpiration: true
            });
            expect(token).to.have.deep.property('user', { id: value.userId });
            expect(token).to.have.property('iat').that.is.a('number');
            expect(token).to.have.property('exp').that.is.a('number');
            expect(token.exp - token.iat, 'token expiration').to.equal(appConfig.jwt.expiresIn);
        })
    })
    
    describe('GET /auth/:id', function() {
        it('should return valid token', async function() {
            const userId = users[0].id;
            const response = await client.get(`auth/${userId}`);

            expect(response.statusCode, 'status code').to.equal(200);

            const schema = Joi.object({                
                token: Joi.string()
                    .required()
            });
            const { error, value } = schema.validate(response.body);
            
            expect(error, 'response body schema error').to.be.undefined;

            const token: any = jwt.verify(value.token, appConfig.jwt.secret, {
                ignoreExpiration: true
            });
            expect(token).to.have.deep.property('user', { id: userId });
            expect(token).to.have.property('iat').that.is.a('number');
            expect(token).to.have.property('exp').that.is.a('number');
            expect(token.exp - token.iat, 'token expiration').to.equal(appConfig.jwt.expiresIn);
        })
    })
})