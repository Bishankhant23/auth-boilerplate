import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinproduction';

export interface AuthRequest extends Request {
    user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access denied' });
        return;
    }

    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.user = verified;
        return next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
    }
};
