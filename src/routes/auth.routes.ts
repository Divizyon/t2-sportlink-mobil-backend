import { Router } from 'express';
import passport from 'passport';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth login
 *     description: Initiates Google OAuth flow
 *     responses:
 *       302:
 *         description: Redirects to Google login
 */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Google OAuth callback
 *     description: Handles the Google OAuth callback
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Authentication failed
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  AuthController.handleGoogleCallback as any
);

/**
 * @swagger
 * /auth/instagram:
 *   get:
 *     tags: [Auth]
 *     summary: Instagram OAuth login
 *     description: Initiates Instagram OAuth flow
 *     responses:
 *       302:
 *         description: Redirects to Instagram login
 */
router.get('/instagram', passport.authenticate('instagram'));

/**
 * @swagger
 * /auth/instagram/callback:
 *   get:
 *     tags: [Auth]
 *     summary: Instagram OAuth callback
 *     description: Handles the Instagram OAuth callback
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Authentication failed
 */
router.get(
  '/instagram/callback',
  passport.authenticate('instagram', { session: false }),
  AuthController.handleInstagramCallback as any
);

export default router;
