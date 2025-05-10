"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notificationController_1 = require("../controllers/notificationController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Bildirim listeleme, işaretleme ve test için rotalar
router.get('/', authMiddleware_1.authenticate, notificationController_1.getNotifications);
router.get('/unread/count', authMiddleware_1.authenticate, notificationController_1.getUnreadCount);
router.patch('/:notificationId/read', authMiddleware_1.authenticate, notificationController_1.markAsRead);
router.patch('/read-all', authMiddleware_1.authenticate, notificationController_1.markAllAsRead);
router.post('/test', authMiddleware_1.authenticate, notificationController_1.sendTestNotification);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map