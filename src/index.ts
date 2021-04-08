import Koa from 'koa';
import startServer from './server';

const app = new Koa();
startServer(app);