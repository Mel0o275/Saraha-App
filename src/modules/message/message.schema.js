import joi from "joi";
import { generalValidation } from "../../common/validation/validation.js";
import { fieldValidation } from "../../common/utils/multer/upload.multer.js";

export const sendMessage = {
        params: joi.object({
                reciverId: generalValidation.userId.required()
        }),
        body: joi.object({
                content: joi.string().min(2).max(100000),
        }),
        files: joi.array().items(generalValidation.file(fieldValidation.image)).min(0).max(2)
}



