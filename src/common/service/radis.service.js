import {redisClient} from '../../db/radis.connection.js';

export const revokeTokenKey = (userId, jti) => {
    return `revoked_tokens:${revokeTokenBaseKey(userId)}:${jti}`;
}

export const revokeTokenBaseKey = (userId) => {
    return `revoked_tokens:${userId.toString()}`;
}

export const set = async (key, value, expireTime) => {
    try {
        await redisClient.set(key, value, {
            EX: expireTime
        });
    } catch (error) {
        console.error("Error setting value in Redis:", error);
        throw error;
    }
}

export const get = async (key) => {
    try {
        const value = await redisClient.get(key);
        return value;
    } catch (error) {
        console.error("Error getting value from Redis:", error);
        throw error;
    }
}

export const update = async (key, value, expireTime) => {
    try {
        await redisClient.set(key, value, {
            EX: expireTime
        });
    } catch (error) {
        console.error("Error updating value in Redis:", error);
        throw error;
    }
}

export const deleteKey = async (key) => {
    try {
        if (!key) return 0;

        if (Array.isArray(key)) {
            if (key.length === 0) return 0;
            return await redisClient.del(key);
        }

        return await redisClient.del(key);
    } catch (error) {
        console.error("Error deleting key from Redis:", error);
        throw error;
    }
};

export const ttl = async (key) => {
    try {
        return await redisClient.ttl(key);
    } catch (error) {
        console.error("Error getting TTL from Redis:", error);
        throw error;
    }
}

export const keyByPrefix = async (prefix) => {
    try {
        const keys = await redisClient.keys(`${prefix}*`);
        return keys;
    } catch (error) {
        console.error("Error getting keys by prefix from Redis:", error);
        throw error;
    }
}

export const mGet = async (keys = []) => {
    try {
        if (!keys.length) {
            return 0;
        }
        const values = await redisClient.mGet(keys);
        return values;
    } catch (error) {
        console.error("Error getting multiple values from Redis:", error);
        throw error;
    }
}