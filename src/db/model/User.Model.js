import mongoose from "mongoose";
import { ProviderEnum, RoleEnum } from "../../common/Enum/user.enum.js";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: { type: String, required: true, unique: true },

        password: { type: String, required: function () { return this.provider == ProviderEnum.LOCAL } },

        phone: { type: String },

        age: { type: Number, min: 18, max: 60 },

        role: { type: String, enum: Object.values(RoleEnum), default: RoleEnum.USER },

        provider: { type: String, enum: Object.values(ProviderEnum), default: ProviderEnum.LOCAL },

        otp: { type: String },

        otpExpires: { type: Date },

        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const UserModel =
    mongoose.models.User || mongoose.model("User", UserSchema);
