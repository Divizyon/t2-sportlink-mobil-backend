import { Router } from 'express';
import { 
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriendRequests,
  getFriends,
  checkFriendshipStatus
} from '../controllers/friendController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Tüm rotalar için kimlik doğrulama gereklidir
router.use(authenticate);

// Arkadaşlık isteği gönder
router.post('/request/:userId', sendFriendRequest);

// Arkadaşlık isteğini kabul et
router.put('/accept/:requestId', acceptFriendRequest);

// Arkadaşlık isteğini reddet
router.put('/reject/:requestId', rejectFriendRequest);

// Arkadaşlık ilişkisini sonlandır
router.delete('/:userId', removeFriend);

// Gelen arkadaşlık isteklerini listele
router.get('/requests', getFriendRequests);

// Arkadaşları listele
router.get('/', getFriends);

// İki kullanıcının arkadaşlık durumunu kontrol et
router.get('/status/:userId', checkFriendshipStatus);

export default router; 