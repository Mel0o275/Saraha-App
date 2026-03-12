import { redisClient } from "../db/radis.connection.js";
import geoip from "geoip-lite";
import rateLimit from "express-rate-limit";
export const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: function (req, res) {
        const { contry } = geoip.lookup(req.ip) || {};
        return contry === "EG" ? 5 : 3;
    },
    message: "Too many requests, please try again later.",
    statusCode: 429,
    legacyHeaders: true,
    skipFailedRequests: true,
    handler: (req, res, next, options) => {
        res.status(options.statusCode).json({ message: options.message });
    },
    keyGenerator: (req) => {
        const ip = ipKeyGenerator(req); 
        return `${ip}-${req.path}`;
    },
    store: {
        async incr(key, cb) {
            try {
                const count = await redisClient.incr(key);
                if (count === 1) {
                    await redisClient.expire(key, 60);
                }
                cb(null, count);
            } catch (err) {
                cb(err);
            }
        },
        async resetKey(key) {
            await redisClient.del(key);
        },
        async decrement(key) {
            if (await redisClient.exists(key)) {
                await redisClient.decr(key);
            }
        },
    }
});