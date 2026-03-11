import { UserModel } from '../../db/model/User.Model.js';

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