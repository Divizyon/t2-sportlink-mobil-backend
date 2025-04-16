import { Router } from 'express';
import { userLoginController } from '../controllers/userLoginController';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Kullanıcı giriş geçmişi endpoint'i
router.get('/login-history', authenticateToken, userLoginController.getUserLoginHistory);

export default router; 