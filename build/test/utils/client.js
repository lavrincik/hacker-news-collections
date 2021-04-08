"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticatedClientSecondUser = exports.authenticatedClient = exports.client = void 0;
const got_1 = __importDefault(require("got"));
const config_1 = __importDefault(require("./config"));
const auth_1 = __importDefault(require("../../src/services/auth"));
const data_1 = require("./data");
exports.client = got_1.default.extend({
    prefixUrl: `${config_1.default.url}`,
    responseType: 'json',
    throwHttpErrors: false
});
exports.authenticatedClient = got_1.default.extend({
    prefixUrl: `${config_1.default.url}`,
    responseType: 'json',
    throwHttpErrors: false,
    hooks: {
        beforeRequest: [
            options => {
                const authService = new auth_1.default();
                const token = authService.createToken(data_1.users[0].id);
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        ]
    }
});
exports.authenticatedClientSecondUser = got_1.default.extend({
    prefixUrl: `${config_1.default.url}`,
    responseType: 'json',
    throwHttpErrors: false,
    hooks: {
        beforeRequest: [
            options => {
                const authService = new auth_1.default();
                const token = authService.createToken(data_1.users[1].id);
                options.headers['Authorization'] = `Bearer ${token}`;
            }
        ]
    }
});
//# sourceMappingURL=client.js.map