import { Router } from 'express';
import { sportController } from '../controllers/sportController';

const router = Router();

/**
 * @route GET /api/sports
 * @desc Tüm spor dallarını listele
 * @access Public
 */
router.get('/', sportController.getAllSports);

/**
 * @route GET /api/sports/:id
 * @desc Spor dalı detayını getir
 * @access Public
 */
router.get('/:id', sportController.getSportById);

export default router; 