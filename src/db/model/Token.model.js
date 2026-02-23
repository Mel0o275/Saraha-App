import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    jwtId: { type: String, required: true },

    expiresAt: { type: Date, required: true },
    
},{ timestamps: true });

tokenSchema.index("expiresAt", { expireAfterSeconds: 0 });
export const TokenModel = mongoose.models.Token || mongoose.model("Token", tokenSchema);