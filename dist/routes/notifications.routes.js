"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Kullanıcı bildirimlerini getir (kimlik doğrulama gerekli)
router.get('/user/:userId', auth_middleware_1.isAuthenticated, notifications_controller_1.getUserNotifications);
// Okunmamış bildirim sayısını getir (kimlik doğrulama gerekli)
router.get('/user/:userId/unread-count', auth_middleware_1.isAuthenticated, notifications_controller_1.getUnreadCount);
// Tüm bildirimleri okundu olarak işaretle (kimlik doğrulama gerekli)
router.put('/user/:userId/mark-all-as-read', auth_middleware_1.isAuthenticated, notifications_controller_1.markAllAsRead);
// Bildirimi okundu olarak işaretle (kimlik doğrulama gerekli)
router.put('/:id/mark-as-read', auth_middleware_1.isAuthenticated, notifications_controller_1.markAsRead);
// Belirli bir bildirimi getir (kimlik doğrulama gerekli)
router.get('/:id', auth_middleware_1.isAuthenticated, notifications_controller_1.getNotificationById);
// Bildirimi sil (kimlik doğrulama gerekli)
router.delete('/:id', auth_middleware_1.isAuthenticated, notifications_controller_1.deleteNotification);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map