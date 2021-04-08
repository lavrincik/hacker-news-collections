import { getRepository } from "typeorm";
import { User } from '../entities/user';
import jsonwebtoken from 'jsonwebtoken';
import config from "../configs";

export default class AuthService {
    public async createUser(): Promise<User> {
        const userRepository = getRepository(User);
        const user = await userRepository.save(new User());
        return user;
    }

    public async userExist(id: number): Promise<boolean> {
        const userRepository = getRepository(User);
        const user = await userRepository.findOne({
            where: { id }
        });
        
        return (user !== undefined);
    }

    public createToken(userId: number): string {
        return jsonwebtoken.sign({
            user: {
                id: userId
            }
          }, 
          config.jwt.secret,
          { expiresIn: config.jwt.expiresIn });
    }
}