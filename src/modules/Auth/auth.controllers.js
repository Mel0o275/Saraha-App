import { Router } from "express";
import { login, resendOtpService, signUp, verifyOtpService } from "./auth.service.js";

const router = Router();

router.post("/signup", async (req, res) => {
    const input = req.body;
    try {
        const result = await signUp(input);
        res.status(201).json({ message: "User registered successfully", data: {
            result
            } });
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
        res.status(201).json({ message: "User logged in successfully", data: {
            token
        }} );
    } catch (error) {
        res.status(500).json({ message: "Error logging in user", error: error.message });
    }
});
export default router;