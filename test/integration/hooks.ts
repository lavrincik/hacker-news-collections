import { clearDb, seedDb } from '../utils/db';

export const mochaHooks = {
    async beforeEach(): Promise<void> {
        await seedDb();
    },

    async afterEach(): Promise<void> {
        await clearDb();
    }
};