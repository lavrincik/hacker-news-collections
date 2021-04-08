import sinon from "sinon";

export const mochaHooks = {
    async beforeEach(): Promise<void> {
        sinon.restore();
    },

    async afterEach(): Promise<void> {
        
    }
};