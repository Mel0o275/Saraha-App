import { UserModel } from "../../db/model/User.Model.js";
import { compareHash, generateHash } from "../../common/security/hash.security.js";
import { encryptData } from "../../common/security/encrypt.security.js";
import { sendOtpEmail } from "../../common/utils/otp/email.otp.js";
import { REFRESH_SYSTEM_TOKEN_SECRET_KEY, REFRESH_USER_TOKEN_SECRET_KEY, SYSTEM_TOKEN_SECRET_KEY, USER_TOKEN_SECRET_KEY } from "../../../config/config.service.js";
import { ProviderEnum, RefreshAudianceEnum, RoleEnum, TokenTypeEnum } from "../../common/Enum/user.enum.js";
import { AudianceEnum } from "../../common/Enum/user.enum.js";
import { createLoginCredentials, generateToken, getTokenSignature } from "../../common/security/token.security.js";
import { OAuth2Client } from 'google-auth-library';

export const signUp = async (inputs) => {
    const { name, email, password, phone, age } = inputs;
    const exist = await UserModel.findOne({ email: email });
    const hashedPassword = await generateHash(password);
    const cryptedPhonr = await encryptData(phone);
    console.log(cryptedPhonr);
    if (exist) {
        throw new Error('User with this email already exists');
    }
    const randomOTP = Math.floor(1000 + Math.random() * 9000);
    const otpHash = await generateHash(randomOTP.toString());
    const user = new UserModel({
        name,
        email,
        password: hashedPassword,
        phone: cryptedPhonr,
        age,
        otp: otpHash,
        otpExpires: new Date(Date.now() + 5 * 60 * 1000),
        isVerified: false,
    });
    await user.save();
    await sendOtpEmail(email, randomOTP);
    return user;
}

export const signUpWithGoogle = async (idToken) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: '905435648785-h4o7bnprocue7pf5lcgenkn6a729014r.apps.googleusercontent.com'  // Specify the WEB_CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload);
    if (!payload.email_verified) {
        throw new Error('Email not verified by Google');
    }
    const exist = await UserModel.findOne({ email: payload.email });
    if (exist) {
        if (exist.provider === ProviderEnum.LOCAL) {
            throw new Error("User with this email already exists. Please login with email/password.");
        }
        return await loginWithGoogle(idToken);
    }
    const user = await UserModel.create({
        name: payload.name,
        email: payload.email,
        provider: ProviderEnum.GOOGLE,
        isVerified: true,
    })
    return user
}

export const verifyOtpService = async (email, otp) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    if (user.isVerified) {
        return { message: "User already verified" };
    }

    if (!user.otp || !user.otpExpires) {
        throw new Error("OTP not found, please request a new one");
    }

    if (new Date(user.otpExpires).getTime() < Date.now()) {
        throw new Error("OTP has expired");
    }

    const isOtpValid = await compareHash(String(otp), user.otp);
    if (!isOtpValid) {
        throw new Error("Invalid OTP");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return {
        message: "Account verified",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        },
    };
};

export const resendOtpService = async (email) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }

    if (user.isVerified) {
        throw new Error("User already verified");
    }

    const randomOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = await generateHash(randomOTP);
    user.otp = otpHash;
    user.otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();
    await sendOtpEmail(email, randomOTP);

    return { message: "OTP resent successfully" };
}

export const login = async (inputs) => {
    const { email, password } = inputs;
    const exist = await UserModel.findOne({ email: email });
    if (!exist) {
        throw new Error('User with this email not exists or wrong password');
    }

    if (!exist.isVerified) {
        throw new Error('User with this email not verified');
    }

    const isPasswordValid = await compareHash(password, exist.password);
    if (!isPasswordValid) {
        throw new Error('User with this email not exists or wrong password');
    }

    const { token, refreshToken } = await createLoginCredentials(exist);

    return { token, refreshToken };

}

export const loginWithGoogle = async (idToken) => {
    const client = new OAuth2Client();
    const ticket = await client.verifyIdToken({
        idToken,
        audience: '905435648785-h4o7bnprocue7pf5lcgenkn6a729014r.apps.googleusercontent.com'
        // Or, if multiple clients access the backend:
        //[WEB_CLIENT_ID_1, WEB_CLIENT_ID_2, WEB_CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    console.log(payload);
    if (!payload.email_verified) {
        throw new Error('Email not verified by Google');
    }
    const exist = await UserModel.findOne({ email: payload.email });
    console.log(exist);
    if (!exist || exist.provider !== ProviderEnum.GOOGLE) {
        throw new Error('invalid provider, please login with your email and password');

    }
    return await createLoginCredentials(exist);

}