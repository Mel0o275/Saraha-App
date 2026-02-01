import { compare, hash } from "bcryptjs";

export const generateHash = async (input, salt = 10) => {
    const hashed = await hash(input, salt);
    return hashed;
}

export const compareHash = async (input, hashedValue) => {
    const isMatch = await compare(input, hashedValue);
    return isMatch;
}