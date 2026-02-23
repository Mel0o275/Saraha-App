import joi from "joi";
import { generalValidation } from "../../common/validation/validation.js";

export const loginSchema = {
        body: joi.object().keys({
                email: generalValidation.email.required(),
                password: generalValidation.password.required(),
        }).required(),

        params: joi.object().keys({
                lang: joi.string().valid('en', 'es', 'fr')
        })
}


export const signUpSchema = {
        body: loginSchema.body.append({
                name: generalValidation.name.required(),
                age: generalValidation.age.required(),
                phone: generalValidation.phone.required(),
        }).required(),

        params: joi.object().keys({
                lang: joi.string().valid('en', 'es', 'fr')
        })
}



