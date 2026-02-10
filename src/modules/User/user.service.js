import { TokenTypeEnum } from '../../common/Enum/user.enum.js';
import { createLoginCredentials, verifyToken } from '../../common/security/token.security.js';

export const profile = async(user) => {
    return user;
}

export const rotateToken = async(user) => {
    const result = await createLoginCredentials(user);
    console.log(result);
    return result;
}