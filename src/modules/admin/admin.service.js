import { LogoutTypeEnum, TokenTypeEnum } from '../../common/Enum/user.enum.js';
import { decryptData } from '../../common/security/encrypt.security.js';
import { createLoginCredentials, verifyToken } from '../../common/security/token.security.js';
import { TokenModel } from '../../db/model/Token.model.js';
import { UserModel } from '../../db/model/User.Model.js';
import fs from "fs";
import path from "path";

export const getAllUsers = async () => {
    const users = await UserModel.find().select("-password -refreshTokens").lean();
    return users;
}

export const getSpecificUser = async (userId) => {
    const user = await UserModel.findById(userId).select("-password -refreshTokens").lean();
    if (!user) {
        throw new Error("User not found");
    }
    return user;
}