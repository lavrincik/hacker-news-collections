"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaGlobalSetup = void 0;
const chai_1 = __importDefault(require("chai"));
const sinon_chai_1 = __importDefault(require("sinon-chai"));
async function mochaGlobalSetup() {
    chai_1.default.use(sinon_chai_1.default);
}
exports.mochaGlobalSetup = mochaGlobalSetup;
//# sourceMappingURL=fixtures.js.map