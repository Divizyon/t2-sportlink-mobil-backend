"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Tüm etkinlikleri getir (filtreleme ile)
router.get('/', eventController_1.getAllEvents);
// FILTRELEME VE ARAMA ENDPOINTLERI
// Yakındaki etkinlikleri getir (konum bazlı)
router.get('/nearby', eventController_1.getNearbyEvents);
// Etkinlik arama (spor türü, tarih, konum vb. parametrelerle)
router.get('/search', eventController_1.searchEvents);
// Kullanıcıya özel önerilen etkinlikler
router.get('/recommended', authMiddleware_1.authenticate, eventController_1.getRecommendedEvents);
// Kullanıcının katıldığı etkinlikleri getir
router.get('/my-events', authMiddleware_1.authenticate, eventController_1.getMyEvents);
// Kullanıcının oluşturduğu etkinlikleri getir
router.get('/created-events', authMiddleware_1.authenticate, eventController_1.getCreatedEvents);
// Bitiş tarihi geçmiş etkinlikleri güncelle
router.post('/update-expired', authMiddleware_1.authenticate, async (req, res) => {
    try {
        const { userService } = require('../services/userService');
        const result = await userService.updateExpiredEvents();
        return res.status(result.success ? 200 : 500).json({
            ...result,
            triggered_by: req.user.username,
            triggered_at: new Date().toISOString()
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Etkinlikleri güncellerken bir hata oluştu',
            error: error.message
        });
    }
});
// Yeni etkinlik oluştur
router.post('/', authMiddleware_1.authenticate, eventController_1.createEvent);
// Etkinlik detayını getir - Parametrik route'lar sonda olmalı
router.get('/:eventId', eventController_1.getEventById);
// Etkinlik güncelle (sadece oluşturan)
router.put('/:eventId', authMiddleware_1.authenticate, eventController_1.updateEvent);
// Etkinlik sil (sadece oluşturan)
router.delete('/:eventId', authMiddleware_1.authenticate, eventController_1.deleteEvent);
// Etkinliğe katıl
router.post('/:eventId/join', authMiddleware_1.authenticate, eventController_1.joinEvent);
// Etkinlikten ayrıl
router.post('/:eventId/leave', authMiddleware_1.authenticate, eventController_1.leaveEvent);
// Etkinliğin davet kodunu getir (sadece oluşturan)
router.get('/:eventId/invitation', authMiddleware_1.authenticate, eventController_1.getEventInvitationCode);
// DEĞERLENDIRME ENDPOINTLERI
// Etkinlik değerlendir
router.post('/:eventId/rate', authMiddleware_1.authenticate, eventController_1.rateEvent);
// Etkinlik değerlendirmelerini görüntüle
router.get('/:eventId/ratings', eventController_1.getEventRatings);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map