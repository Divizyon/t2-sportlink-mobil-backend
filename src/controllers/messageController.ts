/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import multer from 'multer';
import path from 'path';
import { supabase } from '../config/supabase';
import fs from 'fs';

// Multer yapılandırması - geçici dosya depolama
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

export const messageController = {
  // Yeni konuşma oluştur
  async createConversation(req: Request, res: Response) {
    try {
      const { userIds, name, isGroup } = req.body;
      const userId = req.user.id;
      
      // Kullanıcı kendisi de konuşmaya dahil olmalı
      if (!userIds.includes(userId)) {
        userIds.push(userId);
      }
      
      const conversation = await messageService.createConversation(userIds, name, isGroup);
      
      return res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Konuşma oluşturulurken bir hata oluştu'
      });
    }
  },
  
  // Kullanıcının konuşmalarını getir
  async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const { limit, offset } = req.query;
      
      const conversations = await messageService.getUserConversations(
        userId,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );
      
      return res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Konuşmalar getirilirken bir hata oluştu'
      });
    }
  },
  
  // Konuşma mesajlarını getir
  async getConversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      const { limit, offset } = req.query;
      
      const messages = await messageService.getConversationMessages(
        conversationId,
        userId,
        limit ? parseInt(limit as string) : 20,
        offset ? parseInt(offset as string) : 0
      );
      
      return res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Mesajlar getirilirken bir hata oluştu'
      });
    }
  },
  
  // Mesaj gönder
  async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId, content, mediaUrl } = req.body;
      const senderId = req.user.id;
      
      const message = await messageService.sendMessage(conversationId, senderId, content, mediaUrl);
      
      return res.status(201).json({
        success: true,
        data: message
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Mesaj gönderilirken bir hata oluştu'
      });
    }
  },
  
  // Medya içeren mesaj gönderme
  async sendMediaMessage(req: Request, res: Response) {
    return new Promise<void>((resolve, reject) => {
      try {
        // Dosya yükleme işlemi için middleware
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
              const message = await messageService.sendMessage(conversationId, senderId, content);
              res.status(201).json({
                success: true,
                data: message
              });
              return resolve();
            }
            
            // Dosyayı Supabase Storage'a yükle
            const filePath = req.file.path;
            const fileName = `${Date.now()}_${req.file.originalname}`;
            const fileExtension = path.extname(req.file.originalname);
            const mediaType = req.file.mimetype.startsWith('image/') ? 'images' : 'files';
            
            const fileBuffer = fs.readFileSync(filePath);
            
            const { data, error } = await supabase
              .storage
              .from('message-media')
              .upload(`${mediaType}/${senderId}/${fileName}`, fileBuffer, {
                contentType: req.file.mimetype,
                upsert: false
              });
            
            // Geçici dosyayı sil
            fs.unlinkSync(filePath);
            
            if (error) {
              res.status(500).json({
                success: false,
                message: 'Dosya yükleme hatası: ' + error.message
              });
              return resolve();
            }
            
            // Dosya URL'ini al
            const { data: { publicUrl } } = supabase
              .storage
              .from('message-media')
              .getPublicUrl(`${mediaType}/${senderId}/${fileName}`);
            
            // Mesajı gönder
            const message = await messageService.sendMessage(conversationId, senderId, content, publicUrl);
            
            res.status(201).json({
              success: true,
              data: message
            });
            return resolve();
          } catch (innerError: any) {
            console.error('Media mesaj işleme hatası:', innerError);
            res.status(500).json({
              success: false,
              message: innerError.message || 'Medya mesajı işlenirken bir hata oluştu'
            });
            return resolve();
          }
        });
      } catch (error: any) {
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
  async markMessagesAsRead(req: Request, res: Response) {
    try {
      const { messageIds } = req.body;
      const userId = req.user.id;
      
      await messageService.markMessagesAsRead(messageIds, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Mesajlar okundu olarak işaretlendi'
      });
    } catch (error: any) {
      console.error('Mark messages as read error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Mesajlar işaretlenirken bir hata oluştu'
      });
    }
  },
  
  // Konuşmadan ayrılma veya silme
  async leaveConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user.id;
      
      await messageService.leaveConversation(conversationId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Konuşmadan başarıyla ayrıldınız'
      });
    } catch (error: any) {
      console.error('Leave conversation error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Konuşmadan ayrılırken bir hata oluştu'
      });
    }
  }
};