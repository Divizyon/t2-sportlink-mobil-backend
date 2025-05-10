"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messageService = void 0;
const supabase_1 = require("../config/supabase");
const prisma_1 = __importDefault(require("../config/prisma"));
exports.messageService = {
    /**
     * Yeni bir konuşma oluşturur
     */
    async createConversation(userIds, name, isGroup = false) {
        // Grup değilse ve tam olarak 2 kullanıcı varsa, önceden mevcut bir konuşma var mı kontrol et
        if (!isGroup && userIds.length === 2) {
            const existingConversation = await prisma_1.default.conversation.findFirst({
                where: {
                    is_group: false,
                    participants: {
                        every: {
                            user_id: {
                                in: userIds
                            }
                        }
                    }
                },
                include: {
                    participants: {
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    username: true,
                                    profile_picture: true
                                }
                            }
                        }
                    }
                }
            });
            if (existingConversation) {
                return existingConversation;
            }
        }
        // Yeni konuşma oluştur
        const conversation = await prisma_1.default.conversation.create({
            data: {
                name: name,
                is_group: isGroup,
                participants: {
                    create: userIds.map(userId => ({
                        user_id: userId,
                        is_admin: isGroup ? (userIds.indexOf(userId) === 0) : false
                    }))
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                profile_picture: true
                            }
                        }
                    }
                }
            }
        });
        return conversation;
    },
    /**
     * Mesaj gönderir ve Supabase aracılığıyla realtime bildirim sağlar
     */
    async sendMessage(conversationId, senderId, content, mediaUrl) {
        // Kullanıcının bu konuşmanın bir katılımcısı olduğunu doğrula
        const participant = await prisma_1.default.conversation_participant.findUnique({
            where: {
                conversation_id_user_id: {
                    conversation_id: conversationId,
                    user_id: senderId
                }
            }
        });
        if (!participant) {
            throw new Error('Bu konuşmaya mesaj gönderme yetkiniz yok');
        }
        // Mesajı oluştur
        const message = await prisma_1.default.message.create({
            data: {
                conversation_id: conversationId,
                sender_id: senderId,
                content,
                media_url: mediaUrl
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        profile_picture: true
                    }
                }
            }
        });
        // Konuşmayı güncelle (son mesaj zamanı)
        await prisma_1.default.conversation.update({
            where: { id: conversationId },
            data: { updated_at: new Date() }
        });
        console.log('Mesaj gönderiliyor:', message);
        try {
            // Supabase'den alınan hata nedeniyle, realtime_messages tablosuna yazma işlemini atlıyoruz
            // ve doğrudan kanal üzerinden broadcast yapıyoruz
            // Kanal adını oluştur - conversation: önekini kaldırıyoruz
            // const channelName = `conversation:${conversationId}`;
            const channelName = `${conversationId}`;
            console.log(`Supabase kanalı oluşturuluyor: ${channelName}`);
            // Yeni bir realtime kanal oluştur
            const channel = supabase_1.supabase.channel(channelName);
            // Kanala abone ol ve mesaj gönder
            channel
                .on('broadcast', { event: 'message' }, (payload) => {
                console.log('Yeni mesaj alındı:', payload);
            })
                .subscribe(async (status) => {
                console.log('Supabase kanal durumu:', status);
                if (status === 'SUBSCRIBED') {
                    // Broadcast mesajı gönder
                    await channel.send({
                        type: 'broadcast',
                        event: 'message',
                        payload: {
                            id: message.id,
                            conversation_id: conversationId,
                            sender_id: senderId,
                            content,
                            media_url: mediaUrl,
                            created_at: message.created_at.toISOString()
                        }
                    });
                    console.log('Broadcast mesajı gönderildi');
                }
            });
        }
        catch (error) {
            console.error('Supabase mesaj gönderme hatası:', error);
        }
        return message;
    },
    /**
     * Kullanıcıya ait konuşmaları getirir
     */
    async getUserConversations(userId, limit = 20, offset = 0) {
        const conversations = await prisma_1.default.conversation.findMany({
            where: {
                participants: {
                    some: {
                        user_id: userId,
                        left_at: null // Sadece hala üye olunan konuşmaları getir
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                first_name: true,
                                last_name: true,
                                profile_picture: true
                            }
                        }
                    }
                },
                messages: {
                    orderBy: {
                        created_at: 'desc'
                    },
                    take: 1, // Son mesajı getir
                    include: {
                        sender: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updated_at: 'desc' // En son aktif olan konuşmaları ilk göster
            },
            take: limit,
            skip: offset
        });
        return conversations;
    },
    /**
     * Bir konuşmanın mesajlarını getirir
     */
    async getConversationMessages(conversationId, userId, limit = 20, offset = 0) {
        // Kullanıcının bu konuşmanın bir katılımcısı olduğunu doğrula
        const participant = await prisma_1.default.conversation_participant.findUnique({
            where: {
                conversation_id_user_id: {
                    conversation_id: conversationId,
                    user_id: userId
                }
            }
        });
        if (!participant) {
            throw new Error('Bu konuşmaya erişim yetkiniz yok');
        }
        const messages = await prisma_1.default.message.findMany({
            where: {
                conversation_id: conversationId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        first_name: true,
                        last_name: true,
                        profile_picture: true
                    }
                },
                read_by: true
            },
            orderBy: {
                created_at: 'desc' // En yeni mesajları önce getir
            },
            take: limit,
            skip: offset
        });
        return messages;
    },
    /**
     * Mesajları okundu olarak işaretler
     */
    async markMessagesAsRead(messageIds, userId) {
        // Önce mesajların hepsinin aynı konuşmada olduğunu ve kullanıcının bu konuşmaya erişim hakkı olduğunu doğrula
        if (messageIds.length === 0)
            return [];
        const messages = await prisma_1.default.message.findMany({
            where: {
                id: { in: messageIds }
            },
            select: {
                id: true,
                conversation_id: true
            }
        });
        if (messages.length === 0)
            return [];
        const conversationId = messages[0].conversation_id;
        // Tüm mesajların aynı konuşmada olduğunu doğrula
        const allInSameConversation = messages.every(m => m.conversation_id === conversationId);
        if (!allInSameConversation) {
            throw new Error('Tüm mesajlar aynı konuşmada olmalıdır');
        }
        // Kullanıcının bu konuşmanın bir katılımcısı olduğunu doğrula
        const participant = await prisma_1.default.conversation_participant.findUnique({
            where: {
                conversation_id_user_id: {
                    conversation_id: conversationId,
                    user_id: userId
                }
            }
        });
        if (!participant) {
            throw new Error('Bu konuşmaya erişim yetkiniz yok');
        }
        // Mesajları okundu olarak işaretle
        const readOperations = messageIds.map(messageId => prisma_1.default.message_read.upsert({
            where: {
                message_id_user_id: {
                    message_id: messageId,
                    user_id: userId
                }
            },
            update: {
                read_at: new Date()
            },
            create: {
                message_id: messageId,
                user_id: userId
            }
        }));
        await prisma_1.default.$transaction(readOperations);
        // Ayrıca, mesajların is_read alanlarını güncelle
        await prisma_1.default.message.updateMany({
            where: {
                id: { in: messageIds }
            },
            data: {
                is_read: true
            }
        });
        // Okundu bilgisini realtime olarak yayınla
        try {
            const message = await prisma_1.default.message.findFirst({
                where: {
                    id: { in: messageIds }
                },
                select: {
                    conversation_id: true
                }
            });
            if (message) {
                const channelName = `${message.conversation_id}`;
                const channel = supabase_1.supabase.channel(channelName);
                channel.subscribe(async (status) => {
                    if (status === 'SUBSCRIBED') {
                        await channel.send({
                            type: 'broadcast',
                            event: 'message_read',
                            payload: {
                                message_ids: messageIds,
                                user_id: userId,
                                read_at: new Date().toISOString()
                            }
                        });
                        console.log('Okundu bilgisi yayınlandı');
                    }
                });
            }
        }
        catch (error) {
            console.error('Okundu bilgisi yayınlama hatası:', error);
        }
        return messageIds;
    },
    /**
     * Konuşmadan ayrılma (veya grup konuşmasını silme)
     */
    async leaveConversation(conversationId, userId) {
        const conversation = await prisma_1.default.conversation.findUnique({
            where: { id: conversationId },
            include: {
                participants: true
            }
        });
        if (!conversation) {
            throw new Error('Konuşma bulunamadı');
        }
        const participant = conversation.participants.find(p => p.user_id === userId);
        if (!participant) {
            throw new Error('Bu konuşmanın katılımcısı değilsiniz');
        }
        // Grup konuşması ise, yalnızca left_at'i güncelle
        if (conversation.is_group) {
            await prisma_1.default.conversation_participant.update({
                where: {
                    conversation_id_user_id: {
                        conversation_id: conversationId,
                        user_id: userId
                    }
                },
                data: {
                    left_at: new Date()
                }
            });
            // Eğer kullanıcı grup yöneticisi ise ve başka yönetici yoksa, başka bir katılımcıyı yönetici yap
            if (participant.is_admin) {
                const otherAdmins = conversation.participants.filter(p => p.is_admin && p.user_id !== userId);
                if (otherAdmins.length === 0) {
                    const activeParticipants = conversation.participants.filter(p => p.left_at === null && p.user_id !== userId);
                    if (activeParticipants.length > 0) {
                        await prisma_1.default.conversation_participant.update({
                            where: {
                                conversation_id_user_id: {
                                    conversation_id: conversationId,
                                    user_id: activeParticipants[0].user_id
                                }
                            },
                            data: {
                                is_admin: true
                            }
                        });
                    }
                }
            }
        }
        else {
            // Birebir konuşma ise, konuşmayı tamamen sil
            await prisma_1.default.conversation.delete({
                where: { id: conversationId }
            });
        }
        return true;
    },
    /**
     * Kullanıcının okunmamış mesaj sayısını getirir
     */
    async getUnreadMessagesCount(userId) {
        try {
            // Kullanıcının katılımcı olduğu konuşmaları bul
            const userConversations = await prisma_1.default.conversation_participant.findMany({
                where: {
                    user_id: userId,
                    left_at: null // Aktif konuşmaları filtrele
                },
                select: {
                    conversation_id: true
                }
            });
            if (!userConversations.length) {
                return 0; // Kullanıcının hiç konuşması yoksa
            }
            const conversationIds = userConversations.map(uc => uc.conversation_id);
            // Okunmamış mesaj sayısını hesapla
            const unreadMessagesCount = await prisma_1.default.message.count({
                where: {
                    conversation_id: {
                        in: conversationIds
                    },
                    sender_id: {
                        not: userId // Kullanıcının kendisinin gönderdiği mesajları dahil etme
                    },
                    is_read: false, // Okunmamış mesajları filtrele
                    read_by: {
                        none: {
                            user_id: userId // Kullanıcı tarafından okunmamış olanları filtrele
                        }
                    }
                }
            });
            return unreadMessagesCount;
        }
        catch (error) {
            console.error('Okunmamış mesaj sayısı hesaplama hatası:', error);
            throw new Error('Okunmamış mesaj sayısı hesaplanırken bir hata oluştu');
        }
    }
};
//# sourceMappingURL=messageService.js.map