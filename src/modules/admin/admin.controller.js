import { Router } from "express";
import { getAllUsers, getSpecificUser } from "./admin.service.js";
import { authentication, authorization } from "../../middleware/Auth.middleware.js";
import { RoleEnum } from "../../common/Enum/user.enum.js";

const router = Router();

router.get("/allUsers", authentication(), authorization(RoleEnum.ADMIN),async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json({
            message: "All users retrieved successfully", data: {
                users
            }
        });
    } catch (error) {
            res.status(500).json({ message: "Error retrieving all users", error: error.message });
    }
})

router.get("/:userId", authentication(), authorization(RoleEnum.ADMIN), async (req, res) => {
    try {
        const user = await getSpecificUser(req.params.userId);
        res.status(200).json({
            message: "User retrieved successfully", data: {
                user
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user", error: error.message });
    }
})

export default router;