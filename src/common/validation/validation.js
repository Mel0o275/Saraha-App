import joi from 'joi';
import { Types } from 'mongoose';

export const generalValidation = {
    name: joi.string().min(2).required(),
    age: joi.number().integer().min(18).max(65).required(),
    phone: joi.string().pattern(/^[0-9]{10}$/).required(),
    email: joi.string().email({ minDomainSegments: 2, maxDomainSegments: 3, tlds: { allow: ['com', 'net', 'edu'] } }).required(),
    password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
    userId: joi.string().custom((value, helper) => {
        return Types.ObjectId.isValid(value) ? value : helper.message("Invalid user ID");
    }).required(),
    file: function(mimetype=[]) {
        return joi.object().keys({
            fieldname: joi.string(),
            originalname: joi.string(),
            encoding: joi.string(),
            mimetype: joi.string().valid(...mimetype),
            finalPath: joi.string().required(),
            destination: joi.string(),
            filename: joi.string(),
            path: joi.string(),
            size: joi.number().max(5 * 1024 * 1024),
        })
    }
}