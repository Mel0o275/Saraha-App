import joi from 'joi';
import { generalValidation } from '../../common/validation/validation.js';
import { fieldValidation } from '../../common/utils/multer/upload.multer.js';

export const shareProfile = {
    params: joi.object().keys({
        userId: generalValidation.userId.required()
    }).required()
}

export const profilePic = {
    file: generalValidation.file(fieldValidation.image).required()
}

export const coverPic = {
    files: joi.array().items(generalValidation.file(fieldValidation.image, 5).required()).min(1).max(5).required()
}
