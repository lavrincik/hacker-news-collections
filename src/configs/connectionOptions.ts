import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import config from "./index";
import { User } from '../entities/user';
import { Collection } from '../entities/collection';
import { Story } from '../entities/story';
import { Comment } from '../entities/comment';

const connectionOptions : PostgresConnectionOptions = {
    type: "postgres",    
    host: config.postgres.host,
    port: config.postgres.port,
    username: config.postgres.user,
    password: config.postgres.password,
    database: config.postgres.database,
    synchronize: config.isProduction() ? false : true,
    logging: false,
    entities: [
        Collection,
        Comment,
        Story,
        User
    ],
    migrations: [
        "build/migrations/**/*.js"
    ]
}

export default connectionOptions;