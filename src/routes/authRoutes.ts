import { Router } from 'express';
import { register, login, forgotPasswordz, resetPassword, getMe, verifyEmail, changePassword } from '../controllers/authController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPasswordz);
router.post('/reset-password', resetPassword);
router.get('/me', authenticateToken, getMe);
router.get('/verify-email', verifyEmail);
router.post('/change-password', authenticateToken, changePassword);
router.get("/reset-password", (req, res) => {
  const { token } = req.query;
  res.send(`
    <html>
      <body>
        Opening app...

        <script>
          window.location.href =
            "myapp://reset-password?token=${token}";
        </script>
      </body>
    </html>
  `);
});


export default router;
