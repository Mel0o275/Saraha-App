import { ENCRYPTION_KEY } from "../../../config/config.service.js";
import crypto from 'crypto';

const IV_LENGTH = 16;
const SECRET = Buffer.from(ENCRYPTION_KEY);

export const encryptData = async (data) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', SECRET, iv);
    let encrypted = cipher.update(data, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export const decryptData = async (encryptedData) => {
    const [iv, encryptedText] = encryptedData.split(':');
    const binIv = Buffer.from(iv, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', SECRET, binIv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf-8');
    return decrypted;
}
