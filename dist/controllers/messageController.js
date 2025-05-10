"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageController = void 0;
const messageService_1 = require("../services/messageService");
const multer_1 = __importDefault(require("multer"));
const supabase_1 = require("../config/supabase");
// Multer yapılandırması - bellek depolama kullanarak dosya sistemi hatalarını önle
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});
exports.messageController = {
    // Yeni konuşma oluştur
    async createConversation(req, res) {
        try {
            const { userIds, name, isGroup } = req.body;
            const userId = req.user.id;
            // Kullanıcı kendisi de konuşmaya dahil olmalı
            if (!userIds.includes(userId)) {
                userIds.push(userId);
            }
            const conversation = await messageService_1.messageService.createConversation(userIds, name, isGroup);
            return res.status(201).json({
                success: true,
                data: conversation
            });
        }
        catch (error) {
            console.error('Create conversation error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Konuşma oluşturulurken bir hata oluştu'
            });
        }
    },
    // Kullanıcının konuşmalarını getir
    async getUserConversations(req, res) {
        try {
            const userId = req.user.id;
            const { limit, offset } = req.query;
            const conversations = await messageService_1.messageService.getUserConversations(userId, limit ? parseInt(limit) : 20, offset ? parseInt(offset) : 0);
            return res.status(200).json({
                success: true,
                data: conversations
            });
        }
        catch (error) {
            console.error('Get conversations error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Konuşmalar getirilirken bir hata oluştu'
            });
        }
    },
    // Konuşma mesajlarını getir
    async getConversationMessages(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            const { limit, offset } = req.query;
            const messages = await messageService_1.messageService.getConversationMessages(conversationId, userId, limit ? parseInt(limit) : 20, offset ? parseInt(offset) : 0);
            return res.status(200).json({
                success: true,
                data: messages
            });
        }
        catch (error) {
            console.error('Get messages error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Mesajlar getirilirken bir hata oluştu'
            });
        }
    },
    // Mesaj gönder
    async sendMessage(req, res) {
        try {
            const { conversationId, content, mediaUrl } = req.body;
            const senderId = req.user.id;
            const message = await messageService_1.messageService.sendMessage(conversationId, senderId, content, mediaUrl);
            return res.status(201).json({
                success: true,
                data: message
            });
        }
        catch (error) {
            console.error('Send message error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Mesaj gönderilirken bir hata oluştu'
            });
        }
    },
    // Medya içeren mesaj gönderme
    async sendMediaMessage(req, res) {
        return new Promise((resolve, reject) => {
            try {
                // Dosya yükleme işlemi için middleware - req ve res tiplerini any olarak belirterek tip uyumsuzluğunu gideriyoruz
                upload.single('media')(req, res, async (err) => {
                    if (err) {
                        res.status(400).json({
                            success: false,
                            message: 'Dosya yükleme hatası: ' + err.message
                        });
                        return resolve();
                    }
                    try {
                        const { conversationId, content } = req.body;
                        const senderId = req.user.id;
                        // Dosya yüklenmemişse normal mesaj gönder
                        if (!req.file) {
                            const message = await messageService_1.messageService.sendMessage(conversationId, senderId, content);
                            res.status(201).json({
                                success: true,
                                data: message
                            });
                            return resolve();
                        }
                        // Dosyayı Supabase Storage'a yükle
                        const fileName = `${Date.now()}_${req.file.originalname}`;
                        const mediaType = req.file.mimetype.startsWith('image/') ? 'images' : 'files';
                        // Memory storage kullandığımızda dosya içeriği req.file.buffer'da
                        const fileBuffer = req.file.buffer;
                        const { data, error } = await supabase_1.supabase
                            .storage
                            .from('message-media')
                            .upload(`${mediaType}/${senderId}/${fileName}`, fileBuffer, {
                            contentType: req.file.mimetype,
                            upsert: false
                        });
                        // Geçici dosya silme işlemi artık gerekli değil
                        // fs.unlinkSync(filePath);
                        if (error) {
                            res.status(500).json({
                                success: false,
                                message: 'Dosya yükleme hatası: ' + error.message
                            });
                            return resolve();
                        }
                        // Dosya URL'ini al
                        const { data: { publicUrl } } = supabase_1.supabase
                            .storage
                            .from('message-media')
                            .getPublicUrl(`${mediaType}/${senderId}/${fileName}`);
                        // Mesajı gönder
                        const message = await messageService_1.messageService.sendMessage(conversationId, senderId, content, publicUrl);
                        res.status(201).json({
                            success: true,
                            data: message
                        });
                        return resolve();
                    }
                    catch (innerError) {
                        console.error('Media mesaj işleme hatası:', innerError);
                        res.status(500).json({
                            success: false,
                            message: innerError.message || 'Medya mesajı işlenirken bir hata oluştu'
                        });
                        return resolve();
                    }
                });
            }
            catch (error) {
                console.error('Media mesaj gönderme hatası:', error);
                res.status(500).json({
                    success: false,
                    message: error.message || 'Medya mesajı gönderilirken bir hata oluştu'
                });
                return resolve();
            }
        });
    },
    // Mesajları okundu olarak işaretle
    async markMessagesAsRead(req, res) {
        try {
            const { messageIds } = req.body;
            const userId = req.user.id;
            await messageService_1.messageService.markMessagesAsRead(messageIds, userId);
            return res.status(200).json({
                success: true,
                message: 'Mesajlar okundu olarak işaretlendi'
            });
        }
        catch (error) {
            console.error('Mark messages as read error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Mesajlar işaretlenirken bir hata oluştu'
            });
        }
    },
    // Konuşmadan ayrılma veya silme
    async leaveConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            await messageService_1.messageService.leaveConversation(conversationId, userId);
            return res.status(200).json({
                success: true,
                message: 'Konuşmadan başarıyla ayrıldınız'
            });
        }
        catch (error) {
            console.error('Leave conversation error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Konuşmadan ayrılırken bir hata oluştu'
            });
        }
    },
    // Okunmamış mesaj sayısını getir
    async getUnreadMessagesCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await messageService_1.messageService.getUnreadMessagesCount(userId);
            return res.status(200).json({
                success: true,
                data: { count }
            });
        }
        catch (error) {
            console.error('Get unread messages count error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Okunmamış mesaj sayısı getirilirken bir hata oluştu'
            });
        }
    }
};
//# sourceMappingURL=messageController.js.map