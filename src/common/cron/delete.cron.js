import cron from 'node-cron';
import { UserModel } from '../../db/model/User.Model.js';

export const deleteUnconfirmedUsersJob = () => {
    cron.schedule('0 * * * *', async () => {
        try {
            const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const result = await UserModel.deleteMany({
                isVerified: false,
                createdAt: { $lt: cutoff }
            });
            console.log(`Deleted ${result.deletedCount} unconfirmed users`);
        } catch (error) {
            console.error('Error deleting unconfirmed users:', error.message);
        }
    });
};