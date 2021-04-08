"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const user_1 = require("../entities/user");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const configs_1 = __importDefault(require("../configs"));
class AuthService {
    async createUser() {
        const userRepository = typeorm_1.getRepository(user_1.User);
        const user = await userRepository.save(new user_1.User());
        return user;
    }
    async userExist(id) {
        const userRepository = typeorm_1.getRepository(user_1.User);
        const user = await userRepository.findOne({
            where: { id }
        });
        return (user !== undefined);
    }
    createToken(userId) {
        const tmp = configs_1.default;
        return jsonwebtoken_1.default.sign({
            user: {
                id: userId
            }
        }, configs_1.default.jwt.secret, { expiresIn: configs_1.default.jwt.expiresIn });
    }
}
exports.default = AuthService;
//# sourceMappingURL=auth.js.map