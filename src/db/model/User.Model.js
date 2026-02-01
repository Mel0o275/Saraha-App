import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },

        email: { type: String, required: true, unique: true },

        password: { type: String, required: true },

        phone: { type: String, required: true },

        age: { type: Number, min: 18, max: 60 },

        otp: { type: String },

        otpExpires: { type: Date },

        isVerified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const UserModel =
    mongoose.models.User || mongoose.model("User", UserSchema);
