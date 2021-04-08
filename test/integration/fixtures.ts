// reflect-metadata shim for TypeORM
import "reflect-metadata";
import { getConnection } from "typeorm";
import { clearDb } from "../utils/db";
import Koa from 'koa';
import startServer from "../../src/server";
import { MochaContext } from "../utils/mocha";
import { fetchHackernews } from "../utils/hackernews";

export async function mochaGlobalSetup(this: MochaContext): Promise<void> {
    this.app = new Koa();
    await startServer(this.app);
    await clearDb();
    await fetchHackernews();
}

export async function mochaGlobalTeardown(): Promise<void> {
    await clearDb();
    await getConnection().close();
}