import { Router } from 'express';
import { 
  getAllEvents, 
  getEventById, 
  createEvent, 
  updateEvent, 
  deleteEvent, 
  joinEvent,
  leaveEvent,
  getMyEvents,
  getCreatedEvents,
  getNearbyEvents,
  searchEvents,
  getRecommendedEvents,
  rateEvent,
  getEventRatings,
  getEventInvitationCode
} from '../controllers/eventController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Tüm etkinlikleri getir (filtreleme ile)
router.get('/', getAllEvents);

// FILTRELEME VE ARAMA ENDPOINTLERI
// Yakındaki etkinlikleri getir (konum bazlı)
router.get('/nearby', getNearbyEvents);

// Etkinlik arama (spor türü, tarih, konum vb. parametrelerle)
router.get('/search', searchEvents);

// Kullanıcıya özel önerilen etkinlikler
router.get('/recommended', authenticate, getRecommendedEvents);

// Kullanıcının katıldığı etkinlikleri getir
router.get('/my-events', authenticate, getMyEvents);

// Kullanıcının oluşturduğu etkinlikleri getir
router.get('/created-events', authenticate, getCreatedEvents);

// Bitiş tarihi geçmiş etkinlikleri güncelle
router.post('/update-expired', authenticate, async (req, res) => {
  try {
    const { userService } = require('../services/userService');
    const result = await userService.updateExpiredEvents();
    
    return res.status(result.success ? 200 : 500).json({
      ...result,
      triggered_by: req.user.username,
      triggered_at: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Etkinlikleri güncellerken bir hata oluştu',
      error: error.message
    });
  }
});

// Yeni etkinlik oluştur
router.post('/', authenticate, createEvent);

// Etkinlik detayını getir - Parametrik route'lar sonda olmalı
router.get('/:eventId', getEventById);

// Etkinlik güncelle (sadece oluşturan)
router.put('/:eventId', authenticate, updateEvent);

// Etkinlik sil (sadece oluşturan)
router.delete('/:eventId', authenticate, deleteEvent);

// Etkinliğe katıl
router.post('/:eventId/join', authenticate, joinEvent);

// Etkinlikten ayrıl
router.post('/:eventId/leave', authenticate, leaveEvent);

// Etkinliğin davet kodunu getir (sadece oluşturan)
router.get('/:eventId/invitation', authenticate, getEventInvitationCode);

// DEĞERLENDIRME ENDPOINTLERI
// Etkinlik değerlendir
router.post('/:eventId/rate', authenticate, rateEvent);

// Etkinlik değerlendirmelerini görüntüle
router.get('/:eventId/ratings', getEventRatings);

export default router; 