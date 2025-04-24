import { Router } from 'express';
import { registerDeviceToken, unregisterDeviceToken, getUserDeviceTokens } from '../controllers/deviceController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Cihaz token yönetimi için rotalar
router.post('/register', authenticate, registerDeviceToken);
router.post('/unregister', authenticate, unregisterDeviceToken);
router.get('/user/:userId', authenticate, getUserDeviceTokens);

export default router;