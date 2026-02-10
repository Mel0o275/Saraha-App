import { Router } from "express";
import { login, loginWithGoogle, resendOtpService, signUp, signUpWithGoogle, verifyOtpService } from "./auth.service.js";

const router = Router();

router.post("/signup", async (req, res) => {
    const input = req.body;
    try {
        const result = await signUp(input);
        res.status(201).json({
            message: "User registered successfully", data: {
                result
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await verifyOtpService(email, otp);
        res.status(200).json({ message: "OTP verified successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error verifying OTP", error: error.message });
    }
});

router.post("/resend-otp", async (req, res) => {
    const { email } = req.body;
    try {
        const result = await resendOtpService(email);
        res.status(200).json({ message: "OTP resent successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error resending OTP", error: error.message });
    }
});

router.post("/login", async (req, res) => {
    const input = req.body;
    try {
        const token = await login(input);
        res.status(201).json({
            message: "User logged in successfully", data: {
                token
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
});

router.post("/signup/gmail", async (req, res) => {
    try {
        const { idToken } = req.body;
        const account = await signUpWithGoogle(idToken);

        return res.status(201).json({
            message: "User registered successfully",
            data: { account },
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error registering user",
            error: error.message,
        });
    }
});

router.post("/login/gmail", async (req, res) => {
    try {
        const { idToken } = req.body;
        console.log("typeof idToken:", typeof idToken);
console.log("idToken:", idToken);

        const account = await loginWithGoogle(idToken);

        return res.status(200).json({
            message: "User loggedin successfully",
            data: { account },
        });
    } catch (error) {
        return res.status(400).json({
            message: "Error logging in",
            error: error.message,
        });
    }
});

export default router;