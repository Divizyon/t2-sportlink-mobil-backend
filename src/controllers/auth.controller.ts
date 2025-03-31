import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { RequestWithUser } from '../middlewares/auth.middleware';

export class AuthController {
  /**
   * @swagger
   * /auth/google/callback:
   *   get:
   *     tags: [Auth]
   *     summary: Google OAuth callback handler
   *     description: Handles the callback from Google OAuth
   *     responses:
   *       200:
   *         description: Successfully authenticated
   *       401:
   *         description: Unauthorized
   */
  static async handleGoogleCallback(req: RequestWithUser, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const token = jwt.sign({ user }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      // Mobil uygulamaya token'ı döndür
      return res.json({
        token,
        user,
      });
    } catch (error) {
      console.error('Google callback error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * @swagger
   * /auth/instagram/callback:
   *   get:
   *     tags: [Auth]
   *     summary: Instagram OAuth callback handler
   *     description: Handles the callback from Instagram OAuth
   *     responses:
   *       200:
   *         description: Successfully authenticated
   *       401:
   *         description: Unauthorized
   */
  static async handleInstagramCallback(req: RequestWithUser, res: Response) {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ message: 'Authentication failed' });
      }

      const token = jwt.sign({ user }, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn,
      } as jwt.SignOptions);

      // Mobil uygulamaya token'ı döndür
      return res.json({
        token,
        user,
      });
    } catch (error) {
      console.error('Instagram callback error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
