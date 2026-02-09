"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.resetPassword = exports.forgotPassword = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../utils/prisma");
const crypto_1 = __importDefault(require("crypto"));
const authValidation_1 = require("../validations/authValidation");
const emailService_1 = require("../utils/emailService");
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';
const register = async (req, res) => {
    try {
        const { error } = authValidation_1.signupSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { email, password, name } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, name: user.name } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { error } = authValidation_1.loginSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'Login successful', token });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.login = login;
function generateToken(length = 40) {
    return crypto_1.default.randomBytes(length).toString('hex');
}
const forgotPassword = async (req, res) => {
    try {
        const { error } = authValidation_1.forgotPasswordSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { email } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            // Security best practice: Don't reveal if user exists
            res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
            return;
        }
        const token = generateToken();
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry
        // Save token to database
        await prisma_1.prisma.token.create({
            data: {
                token,
                type: 'RESET_PASSWORD',
                expiresAt,
                userId: user.id,
            },
        });
        // Send email
        await (0, emailService_1.sendResetPasswordEmail)(email, token);
        res.status(200).json({ message: 'If a user with this email exists, a password reset link has been sent.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { error } = authValidation_1.resetPasswordSchema.validate(req.body || {});
        if (error) {
            res.status(400).json({ message: error.details[0].message });
            return;
        }
        const { token, newPassword } = req.body;
        const dbToken = await prisma_1.prisma.token.findUnique({
            where: { token },
            include: { user: true },
        });
        if (!dbToken || dbToken.type !== 'RESET_PASSWORD' || dbToken.expiresAt < new Date()) {
            res.status(400).json({ message: 'Invalid or expired token' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        // Update user password
        await prisma_1.prisma.user.update({
            where: { id: dbToken.userId },
            data: { password: hashedPassword },
        });
        // Delete the used token
        await prisma_1.prisma.token.delete({ where: { id: dbToken.id } });
        res.status(200).json({ message: 'Password reset successful. You can now login with your new password.' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.resetPassword = resetPassword;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
exports.getMe = getMe;
