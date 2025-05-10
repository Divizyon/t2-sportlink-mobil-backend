"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const deviceController_1 = require("../controllers/deviceController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
// Cihaz token yönetimi için rotalar
router.post('/register', authMiddleware_1.authenticate, deviceController_1.registerDeviceToken);
router.post('/unregister', authMiddleware_1.authenticate, deviceController_1.unregisterDeviceToken);
router.get('/user/:userId', authMiddleware_1.authenticate, deviceController_1.getUserDeviceTokens);
router.get('/my-devices', authMiddleware_1.authenticate, deviceController_1.getMyDeviceTokens);
exports.default = router;
//# sourceMappingURL=deviceRoutes.js.map