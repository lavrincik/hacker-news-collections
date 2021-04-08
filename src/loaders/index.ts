import Koa from 'koa';
import { loadHackernewsFirebase } from './firebase';
import loadKoa from './koa';

async function initLoaders(app: Koa<Koa.DefaultState, Koa.DefaultContext>) {
    loadHackernewsFirebase();
    loadKoa(app);
}

export default initLoaders;
