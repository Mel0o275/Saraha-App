import nodemailer from "nodemailer";

export const sendOtpEmail = async (toEmail, otp) => {
    const from = process.env.EMAIL_USER;
    const subject = "Your OTP Code";
    const text = `Your OTP code is: ${otp}`;

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const info = await transporter.sendMail({
        from,
        to: toEmail,
        subject,
        text,
    });
    console.log(info.messageId);

    return info;
};

