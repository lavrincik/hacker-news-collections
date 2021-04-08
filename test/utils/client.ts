import got from 'got';
import config from './config';
import AuthService from '../../src/services/auth';
import { users } from './data';

export const client = got.extend({
	prefixUrl: `${config.url}`,
    responseType: 'json',
    throwHttpErrors: false
})

export const authenticatedClient = got.extend({
    prefixUrl: `${config.url}`,
    responseType: 'json',
    throwHttpErrors: false,
    hooks: {
        beforeRequest: [
            options => {
                const authService = new AuthService();
                const token = authService.createToken(users[0].id);
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        ]
    }
})

export const authenticatedClientSecondUser = got.extend({
    prefixUrl: `${config.url}`,
    responseType: 'json',
    throwHttpErrors: false,
    hooks: {
        beforeRequest: [
            options => {
                const authService = new AuthService();
                const token = authService.createToken(users[1].id);
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        ]
    }
})