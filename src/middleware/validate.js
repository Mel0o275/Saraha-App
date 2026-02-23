
export const validate = (schema) => {
    return (req, res, next) => {
        console.log(schema);
        const keys = Object.keys(schema) || [];
        console.log("keys:", keys);
        const errors = [];
        for (const key of keys) {
            const validationResult = schema[key].validate(req[key], { abortEarly: false });
            if (validationResult.error) {
                errors.push(...validationResult.error.details.map((err) => ({
                    message: err.message,
                })));
            } else {
                req[key] = validationResult.value;
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({
                message: "Validation error",
                errors,
            });
        }
        next();
    }
}