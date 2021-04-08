"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaHooks = void 0;
const sinon_1 = __importDefault(require("sinon"));
exports.mochaHooks = {
    async beforeEach() {
        sinon_1.default.restore();
    },
    async afterEach() {
    }
};
//# sourceMappingURL=hooks.js.map