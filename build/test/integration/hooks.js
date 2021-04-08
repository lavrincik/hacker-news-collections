"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mochaHooks = void 0;
const db_1 = require("../utils/db");
exports.mochaHooks = {
    async beforeEach() {
        await db_1.seedDb();
    },
    async afterEach() {
        await db_1.clearDb();
    }
};
//# sourceMappingURL=hooks.js.map