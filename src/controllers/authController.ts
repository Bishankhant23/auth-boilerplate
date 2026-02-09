import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import crypto from 'crypto';
import { signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, changePasswordSchema } from '../validations/authValidation';
import { AuthRequest } from '../middlewares/authMiddleware';
import { sendResetPasswordEmail, sendVerificationEmail } from '../utils/emailService';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';

export const register = async (req: Request, res: Response) => {
    try {
        const { error } = signupSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        // Generate verification token
        const token = generateToken();
        await prisma.token.create({
            data: {
                token,
                type: 'EMAIL_VERIFICATION',
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                userId: user.id
            }
        });

        await sendVerificationEmail(user.email, token);

        res.status(201).json({
            message: 'User created successfully. Please check your email to verify your account.',
            user: { id: user.id, email: user.email, name: user.name }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { error } = loginSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        if (!user.isVerified) {
            // Generate new verification token
            const verificationToken = generateToken();
            await prisma.token.create({
                data: {
                    token: verificationToken,
                    type: 'EMAIL_VERIFICATION',
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
                    userId: user.id
                }
            });

            await sendVerificationEmail(user.email, verificationToken);

            res.status(403).json({ message: 'Account not verified. A new verification email has been sent.' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

function generateToken(length: number = 40): string {
    return crypto.randomBytes(length).toString('hex');
}

export const forgotPasswordz = async (req: Request, res: Response) => {
    try {
        const { error } = forgotPasswordSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { email } = req.body;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            // Security best practice: Don't reveal if user exists
            res.status(200).json({ message: 'No user found with this email.' });
            return;
        }

        const token = generateToken();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

        // Save token to database
        console.log("hiiii")

        await prisma.token.create({
            data: {
                token,
                type: 'RESET_PASSWORD',
                expiresAt,
                userId: user.id,
            },
        });

        // Send email
        await sendResetPasswordEmail(email, token);

        res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { error } = resetPasswordSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const { token, newPassword } = req.body;

        const dbToken = await prisma.token.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!dbToken || dbToken.type !== 'RESET_PASSWORD' || dbToken.expiresAt < new Date()) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        await prisma.user.update({
            where: { id: dbToken.userId },
            data: { password: hashedPassword },
        });

        // Delete the used token
        await prisma.token.delete({ where: { id: dbToken.id } });

        res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
            },
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const verifyEmail = async (req: Request, res: Response) => {
    try {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            res.status(400).json({ message: 'Invalid token' });
            return;
        }

        const dbToken = await prisma.token.findUnique({
            where: { token },
        });

        if (!dbToken || dbToken.type !== 'EMAIL_VERIFICATION' || dbToken.expiresAt < new Date()) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }

        await prisma.user.update({
            where: { id: dbToken.userId },
            data: { isVerified: true },
        });

        await prisma.token.delete({ where: { id: dbToken.id } });

        res.status(200).json({ message: 'Email verified successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
    try {
        const { error } = changePasswordSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }

        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { oldPassword, newPassword } = req.body;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid old password' });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
