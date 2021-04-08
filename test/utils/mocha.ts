import Koa from 'koa';

export interface MochaContext extends Mocha.Context {
    app: Koa<Koa.DefaultState, Koa.DefaultContext>
}