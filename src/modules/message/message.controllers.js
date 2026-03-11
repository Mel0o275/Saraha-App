import { Router } from "express";
import { fieldValidation, upload } from "../../common/utils/multer/upload.multer.js";
import { validate } from "../../middleware/validate.js";
import * as messageValidator from "./message.schema.js";
import { deleteMessage, getAllMessage, getMessageById, sendMessage } from "./message.service.js";
import { verifyToken } from "../../common/security/token.security.js";
import { TokenTypeEnum } from "../../common/Enum/user.enum.js";
import { authentication } from "../../middleware/Auth.middleware.js";
const router = Router();

router.get("/", authentication(), async (req, res) => {
    try {
        console.log("Retrieving messages for user:", req.user);
        const messages = await getAllMessage(req.user);
        res.status(200).json({ message: "Messages retrieved successfully", data: messages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving messages", error: error.message });
    }
})

router.get("/:messageId", authentication(), async (req, res) => {
    try {
        const messages = await getMessageById(req.params.messageId);
        res.status(200).json({ message: "Message retrieved successfully", data: messages });
    } catch (error) {
        res.status(500).json({ message: "Error retrieving message", error: error.message });
    }
})

router.delete("/:messageId", authentication(), async (req, res) => {
    try {
        console.log("Retrieving messages for user:", req.user);
        const messages = await deleteMessage(req.params.messageId, req.user);
        res.status(200).json({ message: "Messages deleted successfully", data: messages });
    } catch (error) {
        res.status(500).json({ message: "Error deleted messages", error: error.message });
    }
})

router.post("/:reciverId", 
async(req, res, next) => {
    if(req.headers.authorization) {
        const {user, decoded} = await verifyToken({ token: req.headers?.authorization, tokenType: TokenTypeEnum.TOKEN });
        req.user = user;
        req.decoded = decoded;

        console.log("User authenticated:", req.user);

    }

    next();
},
upload({
    customPath: "message/images", validation: fieldValidation.image, size: 10
}).array("image", 2),
    validate(messageValidator.sendMessage),
    async (req, res) => {
    if (!req.body?.content && !req.files) {
        return res.status(400).json({ message: "Content or images are required" });
    }
    try {
        const message = await sendMessage(req.params.reciverId, req.files, req.body, req.user);
        res.status(201).json({ message: "Message sent successfully", data: message });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error: error.message });
    }
})


export default router;