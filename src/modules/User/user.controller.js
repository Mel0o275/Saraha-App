import { Router } from "express";
import { profile, rotateToken } from "./user.service.js";
import { authentication, authorization } from "../../middleware/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../common/Enum/user.enum.js";

const router = Router();

router.get("/profile", authentication(),async (req, res) => {
    try {
        const account = await profile(req.user);
        res.status(200).json({ message: "User profile retrieved successfully", data: {
        account
        } });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error.message });
    }
})

router.get("/rotate", authentication(TokenTypeEnum.REFRESH),async (req, res) => {
    try {
        const account = await rotateToken(req.user);
        res.status(200).json({ message: "User profile retrieved successfully", data: {
        account
        } });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error.message });
    }
})

export default router;