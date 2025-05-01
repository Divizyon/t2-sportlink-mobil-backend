import { Router } from 'express';
import { registerDeviceToken, unregisterDeviceToken, getUserDeviceTokens, getMyDeviceTokens } from '../controllers/deviceController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Cihaz token yönetimi için rotalar
router.post('/register', authenticate, registerDeviceToken);
router.post('/unregister', authenticate, unregisterDeviceToken);
router.get('/user/:userId', authenticate, getUserDeviceTokens);
router.get('/my-devices', authenticate, getMyDeviceTokens);

export default router;