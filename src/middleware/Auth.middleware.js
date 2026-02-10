import { TokenTypeEnum } from '../common/Enum/user.enum.js';
import { verifyToken } from '../common/security/token.security.js';

export const authentication = (tokenType=TokenTypeEnum.TOKEN) => {
    return async(req, res, next) => {
        if(!req.headers.authorization) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const {user} = await verifyToken({ token: req.headers?.authorization, tokenType });
        req.user = user;
        next();
    }
}

export const authorization = (accessRoles = []) => {
    return async(req, res, next) => {
        console.log(req.user.role);
        if(!accessRoles.includes(req.user.role)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        next();
    }
}