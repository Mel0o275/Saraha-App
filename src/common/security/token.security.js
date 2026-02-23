import jwt from "jsonwebtoken";
import {
    REFRESH_SYSTEM_TOKEN_SECRET_KEY,
    REFRESH_USER_TOKEN_SECRET_KEY,
    SYSTEM_TOKEN_SECRET_KEY,
    USER_TOKEN_SECRET_KEY
} from "../../../config/config.service.js";

import { AudianceEnum, RoleEnum, TokenTypeEnum } from "../Enum/user.enum.js";
import { UserModel } from "../../db/model/User.Model.js";
import { randomUUID } from "crypto";
import { TokenModel } from "../../db/model/Token.model.js";

export const generateToken = async ({
    payload = {},
    secretKey = USER_TOKEN_SECRET_KEY,
    options = {}
} = {}) => {
    return jwt.sign(payload, secretKey, options);
};

export const getTokenSignature = async (role) => {
    let signture;
    let refreshsSignture;
    let audience = AudianceEnum.USER;

    switch (role) {
        case RoleEnum.ADMIN:
            signture = SYSTEM_TOKEN_SECRET_KEY;
            refreshsSignture = REFRESH_SYSTEM_TOKEN_SECRET_KEY;
            audience = AudianceEnum.ADMIN;
            break;

        default:
            signture = USER_TOKEN_SECRET_KEY;
            refreshsSignture = REFRESH_USER_TOKEN_SECRET_KEY;
            audience = AudianceEnum.USER;
            break;
    }

    return { signture, refreshsSignture, audience };
};

export const createLoginCredentials = async (user) => {
    const { signture, refreshsSignture, audience } = await getTokenSignature(user.role);
    const jwtId = randomUUID();
    const token = await generateToken({
        payload: { _id: user._id },
        secretKey: signture,
        options: {
            expiresIn: "30m",
            audience: [TokenTypeEnum.TOKEN, audience] ,
            jwtid: jwtId
        }
    });

    const refreshToken = await generateToken({
        payload: { _id: user._id },
        secretKey: refreshsSignture,
        options: {
            expiresIn: "1y",
            audience: [TokenTypeEnum.REFRESH, audience],
            jwtid: jwtId
        }
    });

    console.log(token, refreshToken);

    return { token, refreshToken };
};

export const verifyToken = async ({ token, tokenType= TokenTypeEnum.TOKEN } = {}) => {
    const decoded = jwt.decode(token);
    console.log(decoded);
    
    const revoked = await TokenModel.findOne({ jwtId: decoded.jti });
    if (revoked) throw new Error("Token has been revoked");


    const aud = decoded.aud;
    console.log(aud);

    const [decodedtokenType, role] = aud;

    console.log(decodedtokenType, role);

    if(decodedtokenType !== tokenType) {
        throw new Error("Invalid token type");
    }

    const { signture, refreshsSignture } = await getTokenSignature(role);
    console.log(signture, refreshsSignture);

    const secret = tokenType === TokenTypeEnum.REFRESH ? refreshsSignture : signture;
    console.log(secret);

    const verifiedPayload = jwt.verify(token, secret);

    const user = await UserModel.findOne({ _id: verifiedPayload._id });

    console.log(" Verified User:", user);
    console.log(" Verified Payload:", verifiedPayload);

    if (!user) {
        throw new Error("User not registered");
    }

    if(user.changeCredentialsTime && user.changeCredentialsTime?.getTime() > decoded.iat * 1000) {
        throw new Error("Token has been invalidated due to credential change");
    }

    return {
        tokenType,
        audience: role,
        verifiedPayload,
        user,
        decoded
    };
};
