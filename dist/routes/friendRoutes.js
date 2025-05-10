"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const friendController_1 = require("../controllers/friendController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Tüm rotalar için kimlik doğrulama gereklidir
router.use(authMiddleware_1.authenticate);
// Arkadaşlık isteği gönder
router.post('/request/:userId', friendController_1.sendFriendRequest);
// Arkadaşlık isteğini kabul et
router.put('/accept/:requestId', friendController_1.acceptFriendRequest);
// Arkadaşlık isteğini reddet
router.put('/reject/:requestId', friendController_1.rejectFriendRequest);
// Arkadaşlık ilişkisini sonlandır
router.delete('/:userId', friendController_1.removeFriend);
// Gelen arkadaşlık isteklerini listele
router.get('/requests', friendController_1.getFriendRequests);
// Arkadaşları listele
router.get('/', friendController_1.getFriends);
// İki kullanıcının arkadaşlık durumunu kontrol et
router.get('/status/:userId', friendController_1.checkFriendshipStatus);
// Rastgele arkadaş önerileri al
router.get('/suggestions', friendController_1.getSuggestedFriends);
exports.default = router;
//# sourceMappingURL=friendRoutes.js.map