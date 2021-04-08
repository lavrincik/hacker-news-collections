"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// reflect-metadata shim for TypeORM
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const connectionOptions_1 = __importDefault(require("./configs/connectionOptions"));
const loaders_1 = __importDefault(require("./loaders"));
async function startServer(app) {
    await typeorm_1.createConnection(connectionOptions_1.default);
    await loaders_1.default(app);
    app.listen(3000);
}
exports.default = startServer;
;
//# sourceMappingURL=server.js.map