import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendResetPasswordEmail = async (to: string, token: string) => {
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
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

export const sendVerificationEmail = async (to: string, token: string) => {
    const verificationLink = `http://localhost:3000/api/auth/verify-email?token=${token}`; // Using API link directly for now or frontend

    const mailOptions = {
        from: process.env.FROM_EMAIL || '"Auth System" <no-reply@example.com>',
        to,
        subject: 'Verify Your Email',
        html: `
            <p>Welcome!</p>
            <p>Please click this link to verify your email address:</p>
            <a href="${verificationLink}">${verificationLink}</a>
            <p>This link will expire in 24 hours.</p>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};
