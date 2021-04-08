"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hackernewsApi = exports.loadHackernewsFirebase = void 0;
const firebase_1 = __importDefault(require("firebase"));
require("firebase/database");
const configs_1 = __importDefault(require("../configs"));
let hackernewsApi;
exports.hackernewsApi = hackernewsApi;
async function loadHackernewsFirebase() {
    var firebaseConfig = {
        databaseURL: configs_1.default.hackernews.databaseUrl
    };
    const app = firebase_1.default.initializeApp(firebaseConfig, "hackernews");
    exports.hackernewsApi = hackernewsApi = firebase_1.default.database(app).ref(configs_1.default.hackernews.apiVersion);
}
exports.loadHackernewsFirebase = loadHackernewsFirebase;
//# sourceMappingURL=firebase.js.map