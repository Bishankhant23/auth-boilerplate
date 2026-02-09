"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetPasswordEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
const sendResetPasswordEmail = async (to, token) => {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`; // Adjust frontend URL as needed
    const mailOptions = {
        from: process.env.FROM_EMAIL || '"Auth System" <no-reply@example.com>',
        to,
        subject: 'Password Reset Request',
        html: `
            <p>You requested a password reset</p>
            <p>Click this link to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
        `,
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};
exports.sendResetPasswordEmail = sendResetPasswordEmail;
