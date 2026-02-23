import { resolve } from 'node:path'
import { config } from 'dotenv'

export const NODE_ENV = process.env.NODE_ENV

const envPath = {
    development: `.env.dev`,
}
console.log({ en: envPath[NODE_ENV] });


config({ path: resolve(`./config/${envPath[NODE_ENV]}`) })


export const port = process.env.PORT ?? 7000

export const DB_URL = process.env.DB_URL

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

export const SYSTEM_TOKEN_SECRET_KEY = process.env.SYSTEM_TOKEN_SECRET_KEY;

export const USER_TOKEN_SECRET_KEY = process.env.USER_TOKEN_SECRET_KEY;

export const REFRESH_SYSTEM_TOKEN_SECRET_KEY = process.env.REFRESH_SYSTEM_TOKEN_SECRET_KEY;

export const REFRESH_USER_TOKEN_SECRET_KEY = process.env.REFRESH_USER_TOKEN_SECRET_KEY;

export const REDIS_URL = process.env.REDIS_URL;

console.log({
    SYSTEM_TOKEN_SECRET_KEY,
    USER_TOKEN_SECRET_KEY,
    REFRESH_SYSTEM_TOKEN_SECRET_KEY,
    REFRESH_USER_TOKEN_SECRET_KEY
});

export const SALT_ROUND = parseInt(process.env.SALT_ROUND ?? '10')
console.log({SALT_ROUND});
