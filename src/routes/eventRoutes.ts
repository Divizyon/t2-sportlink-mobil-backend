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
  getEventRatings
} from '../controllers/eventController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Tüm etkinlikleri getir (filtreleme ile)
router.get('/', getAllEvents);

// Etkinlik detayını getir
router.get('/:eventId', getEventById);

// Yeni etkinlik oluştur
router.post('/', authenticate, createEvent);

// Etkinlik güncelle (sadece oluşturan)
router.put('/:eventId', authenticate, updateEvent);

// Etkinlik sil (sadece oluşturan)
router.delete('/:eventId', authenticate, deleteEvent);

// Etkinliğe katıl
router.post('/:eventId/join', authenticate, joinEvent);

// Etkinlikten ayrıl
router.delete('/:eventId/leave', authenticate, leaveEvent);

// Kullanıcının katıldığı etkinlikleri getir
router.get('/my-events', authenticate, getMyEvents);

// Kullanıcının oluşturduğu etkinlikleri getir
router.get('/created-events', authenticate, getCreatedEvents);

// FILTRELEME VE ARAMA ENDPOINTLERI

// Yakındaki etkinlikleri getir (konum bazlı)
router.get('/nearby', getNearbyEvents);

// Etkinlik arama (spor türü, tarih, konum vb. parametrelerle)
router.get('/search', searchEvents);

// Kullanıcıya özel önerilen etkinlikler
router.get('/recommended', authenticate, getRecommendedEvents);

// DEĞERLENDIRME ENDPOINTLERI

// Etkinlik değerlendir
router.post('/:eventId/rate', authenticate, rateEvent);

// Etkinlik değerlendirmelerini görüntüle
router.get('/:eventId/ratings', getEventRatings);

export default router; 