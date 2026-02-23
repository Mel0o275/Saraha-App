import {radisClient} from '../service/radis.connection.js';

export const set = async (key, value, expireTime) => {
    try {
        await radisClient.set(key, value, {
            EX: expireTime
        });
    } catch (error) {
        console.error("Error setting value in Redis:", error);
        throw error;
    }
}

export const get = async (key) => {
    try {
        const value = await radisClient.get(key);
        return value;
    } catch (error) {
        console.error("Error getting value from Redis:", error);
        throw error;
    }
}