import express from 'express';
import { messageController } from '../controllers/messageController';
import { authenticate } from '../middlewares/authMiddleware';

const router = express.Router();

// Tüm mesajlaşma rotaları için kimlik doğrulama gerekli
router.use(authenticate);

// Konuşma rotaları
router.post('/conversations', messageController.createConversation);
router.get('/conversations', messageController.getUserConversations);
router.get('/conversations/:conversationId/messages', messageController.getConversationMessages);
router.delete('/conversations/:conversationId', messageController.leaveConversation);

// Mesaj rotaları
router.post('/messages', messageController.sendMessage);
router.post('/messages/media', messageController.sendMediaMessage); // Medya içeren mesaj gönderme
router.post('/messages/read', messageController.markMessagesAsRead);
router.get('/messages/unread-count', messageController.getUnreadMessagesCount); // Okunmamış mesaj sayısını getir

export default router;