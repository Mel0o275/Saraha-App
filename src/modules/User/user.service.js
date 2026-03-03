import { LogoutTypeEnum, TokenTypeEnum } from '../../common/Enum/user.enum.js';
import { createLoginCredentials, verifyToken } from '../../common/security/token.security.js';
import { deleteKey, keyByPrefix, revokeTokenBaseKey, revokeTokenKey, set } from '../../common/service/radis.service.js';
import { UserModel } from '../../db/model/User.Model.js';
import fs from "fs";
import { compareHash, generateHash } from "../../common/security/hash.security.js";


const createRevokeToken = async (userId, jti, iat) => {
    await set(
        revokeTokenKey(userId, jti),
        jti,
        iat + 31557600
    );    
}

export const profile = async(user) => {
    return {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
    };
}

export const shareProfile = async (userId, viewerId = null) => {
    const user = await UserModel.findById(userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (viewerId && viewerId.toString() !== userId.toString()) {
        user.visitCount = (user.visitCount || 0) + 1;
        await user.save();
    }

    const result = {
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture
    };

    return result;
};

export const profilePic = async(file, user) => {
    const profile = await UserModel.findById(user._id);
    if (!profile) {
        throw new Error("User not found");
    }
    profile.gallary.push(profile.profilePicture);
    profile.profilePicture = file.path;
    await profile.save();
    return {
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture
    };
}

export const deleteProfilePic = async (user) => {

    const profile = await UserModel.findById(user._id);
    if (!profile) {
        throw new Error("User not found");
    }

    if (!profile.profilePicture) {
        throw new Error("No profile picture to delete");
    }

    const imagePath = profile.profilePicture;
    if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
    }
    profile.profilePicture = null;
    await profile.save();
    return {
        name: profile.name,
        email: profile.email,
        profilePicture: profile.profilePicture
    };
};

export const coverPic = async (files, user) => {
    const profile = await UserModel.findById(user._id);
    if (!profile) {
        throw new Error("User not found");
    }

    const existingImages = profile.coverPicture || [];
    const newImages = files.map(file => file.path);

    if (existingImages.length + newImages.length !== 2) {
        throw new Error("Total cover images must equal exactly 2");
    }

    profile.coverPicture = [...existingImages, ...newImages];
    await profile.save();

    return {
        name: profile.name,
        email: profile.email,
        coverPicture: profile.coverPicture
    };
};

export const logout = async({device}, user, decode) => {
    let status = 200
    switch (device) {
        case LogoutTypeEnum.ALL:
            user.changeCredentialsTime = new Date(Date.now());
            await user.save();
            // await TokenModel.deleteMany({ userId: decode._id });
            await deleteKey(await keyByPrefix(revokeTokenBaseKey(decode._id)));
            break;
    
        default:
            // const revokToken = await TokenModel.create({
            //     userId: decode._id,
            //     jwtId: decode.jti,
            //     expiresAt: new Date(decode.iat * 1000 + 365 * 24 * 60 * 60 * 1000)
            // })
            // console.log(typeof decode.jti);
            // console.log(decode.jti);
            // const expiresInSeconds = decode.exp - Math.floor(Date.now() / 1000);

            await createRevokeToken(decode._id, decode.jti, decode.iat)           
            status = 201
            break;
    }

    return { message: "Logout successful", status };
}

export const updatePass = async (user, { currentPassword, newPassword }) => {
    const profile = await UserModel.findById(user._id);
    if (!profile) {
        throw new Error("User not found");
    }

    const isMatch = await compareHash(currentPassword, profile.password);
    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = await generateHash(newPassword);
    profile.password = hashedPassword;
    await profile.save();

    return { message: "Password updated successfully" };
}

// export const visitProfile = async (viewer, profileId) => {
//     const profile = await UserModel.findById(profileId);

//     if (!profile) {
//         throw new Error("User not found");
//     }

//     if (viewer._id.toString() !== profileId.toString()) {
//         profile.visitCount += 1;
//         await profile.save();
//     }

//     return {
//         name: profile.name,
//         email: profile.email,
//         profilePicture: profile.profilePicture,
//     };
// };

export const rotateToken = async(user, {jti, iat}, issuer) => {
    if(iat + 1800 * 1000 < Date.now() + (30000)) {
        throw new Error("Token is not eligible for rotation yet");
    }
    await createRevokeToken(decode._id, decode.jti, decode.iat)           
    const result = await createLoginCredentials(user);
    console.log(result);
    return result;
}