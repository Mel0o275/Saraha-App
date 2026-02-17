import joi from "joi";

export const loginSchema = joi.object().keys({
        email: joi.string().email({  minDomainSegments:2, maxDomainSegments:3, tlds: {allow: ['com', 'net', 'edu']}   }).required(),
        password: joi.string().pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)).required(),
}).required();


export const signUpSchema = loginSchema.append({
        name: joi.string().min(2).required(),
        age: joi.number().integer().min(18).max(65).required(),
        phone: joi.string().pattern(/^[0-9]{10}$/).required(),
}).required();



