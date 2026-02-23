import { Router } from "express";
import { coverPic, deleteProfilePic, logout, profile, profilePic, rotateToken, shareProfile, visitProfile } from "./user.service.js";
import { authentication, authorization } from "../../middleware/Auth.middleware.js";
import { RoleEnum, TokenTypeEnum } from "../../common/Enum/user.enum.js";
import { validate } from "../../middleware/validate.js";
import * as validation from "./user.validation.js";
import { fieldValidation, upload } from "../../common/utils/multer/upload.multer.js";
import { UserModel } from "../../db/model/User.Model.js";

const router = Router();

router.get("/profile", authentication(), async (req, res) => {
    try {
        const account = await profile(req.user);
        res.status(200).json({
            message: "User profile retrieved successfully", data: {
                account
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error.message });
    }
})

router.get("/:userId/profile-share", validate(validation.shareProfile), async (req, res) => {
    try {
        const account = await shareProfile(req.params.userId);
        res.status(200).json({
            message: "User profile retrieved successfully", data: {
                account
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error.message });
    }
})

router.patch("/uploadProfile", authentication(), upload({
    customPath: "user/images", validation: fieldValidation.image, size: 10
}).single("image"),
    validate(validation.profilePic)
    , async (req, res) => {
        try {
            console.log(req.file.finalPath);

            const account = await profilePic(req.file, req.user);
            res.status(200).json({
                message: "Profile picture uploaded successfully", data: {
                    account
                }
            });
        } catch (error) {
            res.status(500).json({ message: "Error uploading profile picture", error: error.message });
        }
    }
);

//under development
router.patch(
    "/uploadCover",
    authentication(),
    upload({
        customPath: "user/images",
        validation: fieldValidation.image,
        size: 10
    }).array("cover", 2),
    validate(validation.coverPic),
    async (req, res) => {
        try {

            const account = await coverPic(req.files, req.user);

            res.status(200).json({
                message: "cover pictures uploaded successfully",
                data: { account }
            });

        } catch (error) {
            res.status(500).json({
                message: "Error uploading cover pictures",
                error: error.message
            });
        }
    }
);

router.delete("/deleteProfilePic", authentication(), async (req, res) => {
    try {
        const account = await deleteProfilePic(req.user);
        res.status(200).json({
            message: "Profile picture deleted successfully", data: {
                account
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error deleting profile picture", error: error.message });
    }
})

router.post("/logout", authentication(), async (req, res) => {
    try {
        const { status } = await logout(req.body, req.user, req.decoded);
        res.status(status).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
})

router.get("/profile/:id", authentication(), async (req, res) => {
    try {
        const profile = await visitProfile(req.user, req.params.id);
        res.status(200).json({
            message: "Profile fetched successfully",
            data: profile
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

router.get(
    "/views",
    authentication(),
    authorization(RoleEnum.ADMIN),
    async (req, res) => {
        try {
            const { userId } = req.query;
            if (!userId) {
                return res.status(400).json({
                    message: "User ID is required"
                });
            }

            const profile = await UserModel.findById(userId);
            if (!profile) {
                return res.status(404).json({
                    message: "User not found"
                });
            }
            res.status(200).json({
                message: "Visit count retrieved successfully",
                visitCount: profile.visitCount
            });
        } catch (error) {
            res.status(500).json({
                message: error.message
            });
        }
});

router.get("/rotate", authentication(TokenTypeEnum.REFRESH), async (req, res) => {
    try {
        const account = await rotateToken(req.user);
        res.status(200).json({
            message: "User profile retrieved successfully", data: {
                account
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving user profile", error: error.message });
    }
})

export default router;