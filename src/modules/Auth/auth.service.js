import { UserModel } from "../../db/model/User.Model.js";
import { compareHash, generateHash } from "../../common/security/hash.security.js";
import { encryptData } from "../../common/security/encrypt.security.js";
import { ProviderEnum } from "../../common/Enum/user.enum.js";
import { createLoginCredentials, generateToken } from "../../common/security/token.security.js";
import { OAuth2Client } from 'google-auth-library';
import { deleteKey, get, set, ttl } from "../../common/service/radis.service.js";
import { emailEmitter } from "../../common/utils/otp/email.event.js";
import { sendOtpEmail, sendResetPasswordEmail } from "../../common/utils/otp/email.otp.js";
import { redisClient } from "../../db/radis.connection.js";

export const generateOTP = async (userId, email) => {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = await generateHash(otp.toString());

    await set(`otp_${userId}`, otpHash.toString(), 5 * 60);
    await sendOtpEmail(email, otp);

    return otp;
};

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
    await set(`otp_${email}`, otpHash.toString(), 5 * 60);
    const user = new UserModel({
        name,
        email,
        password: hashedPassword,
        phone: cryptedPhonr,
        age,
        isVerified: false,
    });
    await user.save();
    // await sendOtpEmail(email, randomOTP);
    emailEmitter.emit("sendOtpEmail", email, randomOTP);
    return {
        message: "User created successfully. OTP sent to email.",
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            age: user.age,
            isVerified: user.isVerified,
        }
    };
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

    const redisKey = `otp_${email}`;
    const storedOtpHash = await get(redisKey);
    const isOtpValid = await compareHash(String(otp), storedOtpHash);

    if (!isOtpValid) {
        throw new Error("Invalid OTP");
    }

    user.isVerified = true;
    await user.save();

    await deleteKey(redisKey);

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

    const redisKey = `otp_${email}`;
    const attemptKey = `otp_attempts_${email}`;
    const blockKey = `otp_block_${email}`;

    const isBlocked = await get(blockKey);
    if (isBlocked) {
        const blockTime = await ttl(blockKey);
        throw new Error(`Too many OTP requests. Please try again after ${Math.floor(blockTime / 60)}m ${blockTime % 60}s.`);
    }

    const time = await ttl(redisKey);
    if (time > 0) {
        throw new Error(`OTP already sent. Please wait ${Math.floor(time / 60)}m ${time % 60}s before requesting a new one.`);
    }

    let attempts = await get(attemptKey);
    attempts = attempts ? parseInt(attempts) : 0;
    attempts += 1;

    if (attempts > 3) {
        await set(blockKey, 'blocked', 10 * 60);
        await deleteKey(attemptKey);
        throw new Error("Too many OTP requests. You are blocked for 10 minutes.");
    }

    await set(attemptKey, attempts.toString(), 10 * 60);

    const randomOTP = Math.floor(1000 + Math.random() * 9000).toString();
    const otpHash = await generateHash(randomOTP);
    await set(redisKey, otpHash, 5 * 60);

    // await sendOtpEmail(email, randomOTP);

    emailEmitter.emit("sendOtpEmail", email, randomOTP);

    return { message: "OTP resent successfully" };
};

export const login = async (inputs) => {
    const { email, password } = inputs;
    const exist = await UserModel.findOne({ email: email });
    if (!exist) {
        throw new Error('User with this email does not exist or wrong password');
    }

    if (!exist.isVerified) {
        throw new Error('User with this email not verified');
    }

    const attemptsKey = `login_attempts_${email}`;
    const attempts = Number(await get(attemptsKey)) || 0;
    if (attempts >= 5) {
        const remainingSeconds = await ttl(attemptsKey);
        const minutes = Math.floor(remainingSeconds / 60);
        const seconds = remainingSeconds % 60;
        throw new Error(`Too many failed login attempts. Try again after ${minutes}m ${seconds}s`);
    }

    const isPasswordValid = await compareHash(password, exist.password);
    if (!isPasswordValid) {
        await set(attemptsKey, attempts + 1, 60 * 5);
        throw new Error('User with this email does not exist or wrong password');
    }

    if (exist.twoFactorEnabled) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const otpHash = await generateHash(otp); 
        await set(`otp_login_${exist._id}`, otpHash, 5 * 60);
        console.log(await get(`otp_login_${exist._id}`,));
        await sendOtpEmail(exist.email, otp);

        return { message: 'OTP sent to your email, please confirm login' , userId: exist._id};
    }

    const { token, refreshToken } = await createLoginCredentials(exist);
    return { token, refreshToken };
};

export const confirmLogin2FA = async ({ email, otp }) => {
    const exist = await UserModel.findOne({ email: email });

    const savedOtp = await get(`otp_login_${exist._id}`);
    console.log(savedOtp);

    const isMatch = await compareHash(otp, savedOtp);
    if (!isMatch) throw new Error('Invalid OTP');

    if (!savedOtp) throw new Error('OTP expired or not found');


    console.log(exist);
    if (!exist) throw new Error('User not found');
    await deleteKey(`otp_login_${exist._id}`);

    const { token, refreshToken } = await createLoginCredentials(exist);
    return { token, refreshToken };
};

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

export const forgetPassword = async (email) => {
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error('User with this email does not exist');
    }
    const token = generateToken({ email });
    await redisClient.set(`reset:${token}`, email, "EX", 60 * 60);

    const link = `http://localhost:5173/reset-password?token=${token}`;
    await sendResetPasswordEmail(email, link);

    return { message: "Password reset link sent to email" };
};

export const resetPassword = async (token, newPassword) => {
    const email = await redisClient.get(`reset:${token}`);
    if (!email) {
        throw new Error('Invalid or expired token');
    }

    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const hashedPassword = await generateHash(newPassword);
    user.password = hashedPassword;
    await user.save();

    await redisClient.del(`reset:${token}`);

    return { message: "Password updated successfully" };
};

export const twoFactorAuth = async ({ email }) => {
    const exist = await UserModel.findOne({ email: email });
    if (!exist) {
        throw new Error('User with this email not exists');
    }

    if (exist.twoFactorEnabled)
        return res.status(400).json({ message: '2FA already enabled' });

    const otp = await generateOTP(exist._id, email);
    return { message: 'OTP sent to email' };
}

export const confirm2FA = async ({ userId, otp }) => {
    const otpHash = await get(`otp_${userId}`);
    if (!otpHash) throw new Error('OTP expired or not found');

    const valid = await compareHash(otp, otpHash);
    if (!valid) throw new Error('Invalid OTP');

    const user = await UserModel.findById(userId);
    user.twoFactorEnabled = true;
    await user.save();
    await deleteKey(`otp_${userId}`);

    return { message: '2FA enabled successfully' };
};
