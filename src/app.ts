import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { authenticateToken, AuthRequest } from './middlewares/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/protected', authenticateToken, (req: AuthRequest, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
