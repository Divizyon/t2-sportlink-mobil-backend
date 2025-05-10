"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageController_1 = require("../controllers/messageController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Tüm mesajlaşma rotaları için kimlik doğrulama gerekli
router.use(authMiddleware_1.authenticate);
// Konuşma rotaları
router.post('/conversations', messageController_1.messageController.createConversation);
router.get('/conversations', messageController_1.messageController.getUserConversations);
router.get('/conversations/:conversationId/messages', messageController_1.messageController.getConversationMessages);
router.delete('/conversations/:conversationId', messageController_1.messageController.leaveConversation);
// Mesaj rotaları
router.post('/messages', messageController_1.messageController.sendMessage);
router.post('/messages/media', messageController_1.messageController.sendMediaMessage); // Medya içeren mesaj gönderme
router.post('/messages/read', messageController_1.messageController.markMessagesAsRead);
router.get('/messages/unread-count', messageController_1.messageController.getUnreadMessagesCount); // Okunmamış mesaj sayısını getir
exports.default = router;
//# sourceMappingURL=messageRoutes.js.map