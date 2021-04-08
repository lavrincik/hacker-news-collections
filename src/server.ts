// reflect-metadata shim for TypeORM
import "reflect-metadata";
import { createConnection } from "typeorm";
import connectionOptions from "./configs/connectionOptions";
import Koa from 'koa';
import initLoaders from './loaders';

export default async function startServer(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
    await createConnection(connectionOptions);
    await initLoaders(app);
    app.listen(3000);
};
