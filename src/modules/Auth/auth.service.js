import { UserModel } from "../../db/model/User.Model.js";
import jwt from "jsonwebtoken";
import { compareHash, generateHash } from "../../common/security/hash.security.js";
import { encryptData } from "../../common/security/encrypt.security.js";
import { sendOtpEmail } from "../../common/utils/otp/email.otp.js";

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
        otpExpires: new Date(Date.now() +  60 * 1000),
        isVerified: false,
    });
    await user.save();
    await sendOtpEmail(email, randomOTP);
    return user;
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
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
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
    const token = jwt.sign({ _id: exist._id }, "MYOSHA", { expiresIn: '1h' });
    return token;
}