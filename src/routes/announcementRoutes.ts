import { Router } from 'express';
import * as announcementController from '../controllers/announcementController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/announcements
 * @desc    Tüm duyuruları listeler
 * @access  Public (Admin içerik için authentikasyon gerekir)
 */
router.get('/', announcementController.getAllAnnouncements);

/**
 * @route   GET /api/announcements/:announcementId
 * @desc    ID'ye göre duyuru detayını görüntüler
 * @access  Public (Admin içerik için authentikasyon gerekir)
 */
router.get('/:announcementId', announcementController.getAnnouncementById);

export default router; 