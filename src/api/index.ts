import Router from "@koa/router";
import authRoute from './auth';
import collectionRoute from './collection';
import storyRoute from "./story";
import commentRoute from './comment';

const router = new Router();
authRoute(router);
collectionRoute(router);
storyRoute(router);
commentRoute(router);
export default router; 
