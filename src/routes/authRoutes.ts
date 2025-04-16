import { Router } from 'express';
import { userLoginController } from '../controllers/userLoginController';
import { supabase } from '../config/supabase';

const router = Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Kullanıcı girişi
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               device_info:
 *                 type: string
 *                 description: Cihaz bilgisi
 *               ip_address:
 *                 type: string
 *                 description: IP adresi
 *               location:
 *                 type: string
 *                 description: Konum bilgisi
 *     responses:
 *       200:
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 */
router.post('/login', async (req, res, next): Promise<void> => {
  try {
    // Supabase ile giriş işlemi
    const { email, password, device_info, ip_address, location } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre'
      });
      return;
    }

    // Giriş başarılı olduğunda, kullanıcı bilgilerini req.user'a ekle
    req.user = { id: data.user.id };
    
    // req.body'ye gerekli cihaz bilgilerini ekle
    req.body = {
      ...req.body,
      ip_address: ip_address || req.ip,
      device_info: device_info || req.headers['user-agent'],
      location: location
    };

    // Giriş kaydını oluştur ve bir sonraki middleware'e geç
    await userLoginController.recordLoginSuccess(req, res, next);
    
    // Kullanıcı bilgilerini ve token'ı döndür
    res.json({
      success: true,
      token: data.session.access_token,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router; 