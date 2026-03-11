import { Router } from "express";
import { confirm2FA, confirmLogin2FA, forgetPassword, login, loginWithGoogle, resendOtpService, resetPassword, signUp, signUpWithGoogle, twoFactorAuth, verifyOtpService } from "./auth.service.js";
import { loginSchema, signUpSchema } from "./auth.schema.js";
import { validate } from "../../middleware/validate.js";
import { authentication } from "../../middleware/Auth.middleware.js";

const router = Router();

router.post("/signup", validate(signUpSchema),async (req, res) => {
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

router.post("/login", validate(loginSchema), async (req, res) => {
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

router.post('/login-confirm' ,async (req, res) => {
    try {
        const result = await confirmLogin2FA({ email: req.body.email, otp: req.body.otp });
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
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

router.post("/forget-pass", async (req, res) => {
    const { email } = req.body;
    try {
        const result = await forgetPassword(email);
        res.status(200).json({ message: "Password reset link sent to email" });
    } catch (error) {
        res.status(500).json({ message: "Error sending password reset link", error: error.message });
    }
});

router.post(`/reset-pass`, async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const result = await resetPassword(token, newPassword);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating password", error: error.message });
    }
})

router.post('/enable-2fa', authentication(), async (req, res) => {
    try {
        const result = await twoFactorAuth(req.body);
        res.json(result);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.post('/confirm-2fa', authentication(), async (req, res) => {
    try {
        const result = await confirm2FA({ userId: req.user._id, otp: req.body.otp });
        res.json(result);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

export default router;