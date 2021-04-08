import { MochaContext } from "../utils/mocha";
import chai from 'chai';
import sinonChai from 'sinon-chai';

export async function mochaGlobalSetup(this: MochaContext): Promise<void> {
    chai.use(sinonChai);
}