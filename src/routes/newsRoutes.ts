import { Router } from 'express';
import * as newsController from '../controllers/newsController';

const router = Router();

/**
 * @route GET /api/news
 * @desc Tüm haberleri listeler (filtreleme, sayfalama destekli)
 * @access Public
 */
router.get('/', newsController.getAllNews);

/**
 * @route GET /api/news/latest
 * @desc En son haberleri listeler
 * @access Public
 */
router.get('/latest', newsController.getLatestNews);

/**
 * @route GET /api/news/search
 * @desc Anahtar kelimeye göre haberleri arar
 * @access Public
 */
router.get('/search', newsController.searchNews);

/**
 * @route GET /api/news/sport/:sportId
 * @desc Belirli bir spor dalına ait haberleri listeler
 * @access Public
 */
router.get('/sport/:sportId', newsController.getNewsBySport);

/**
 * @route GET /api/news/:newsId
 * @desc Belirli bir haberin detaylarını getirir
 * @access Public
 */
router.get('/:newsId', newsController.getNewsById);

export default router; 