import { Router } from "express";
import { upload } from "../../common/utils/multer/upload.multer.js";
import { authentication } from "../../middleware/Auth.middleware.js";

const router = Router();

router.post("/upload", authentication(),upload.single("image"),(req, res) => {
        res.json({
            message: "File uploaded successfully",
            file: req.file
        });
    }
);


export default router;