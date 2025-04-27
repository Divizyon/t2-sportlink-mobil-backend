import { Request, Response } from 'express';
import { Friend } from '../models/Friend';

/**
 * Arkadaşlık isteği gönderir
 */
export const sendFriendRequest = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const senderId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'si gereklidir'
      });
    }

    // Kendine istek göndermesini engelle
    if (senderId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Kendinize arkadaşlık isteği gönderemezsiniz'
      });
    }

    try {
      // Aktif veya geçmiş bir istek var mı kontrol et (durumdan bağımsız olarak)
      const existingRequest = await Friend.checkExistingRequest(senderId, userId);

      if (existingRequest) {
        // Eğer istek reddedilmiş veya kabul edilmiş ise, silelim ve yeni istek oluşturalım
        if (existingRequest.status === 'rejected' || existingRequest.status === 'accepted') {
          await Friend.deleteRequest(existingRequest.id);
        } else {
          throw new Error('Bu kullanıcı için bekleyen bir arkadaşlık isteği zaten mevcut');
        }
      }

      const request = await Friend.sendRequest(senderId, userId);
      
      return res.status(201).json({
        success: true,
        message: 'Arkadaşlık isteği başarıyla gönderildi',
        data: { request }
      });
    } catch (error: any) {
      // İş mantığı hataları
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error: any) {
    console.error('Arkadaşlık isteği gönderme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlık isteği gönderilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Arkadaşlık isteğini kabul eder
 */
export const acceptFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'İstek ID\'si gereklidir'
      });
    }

    try {
      const result = await Friend.acceptRequest(requestId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Arkadaşlık isteği kabul edildi',
        data: { friendship: result.newFriendship }
      });
    } catch (error: any) {
      // İş mantığı hataları
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error: any) {
    console.error('Arkadaşlık isteği kabul hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlık isteği kabul edilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Arkadaşlık isteğini reddeder
 */
export const rejectFriendRequest = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: 'İstek ID\'si gereklidir'
      });
    }

    try {
      const rejectedRequest = await Friend.rejectRequest(requestId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Arkadaşlık isteği reddedildi',
        data: { request: rejectedRequest }
      });
    } catch (error: any) {
      // İş mantığı hataları
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error: any) {
    console.error('Arkadaşlık isteği reddetme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlık isteği reddedilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Arkadaşlık ilişkisini sonlandırır
 */
export const removeFriend = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'si gereklidir'
      });
    }

    try {
      await Friend.removeFriend(currentUserId, userId);
      
      return res.status(200).json({
        success: true,
        message: 'Arkadaşlık başarıyla sonlandırıldı'
      });
    } catch (error: any) {
      // İş mantığı hataları
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  } catch (error: any) {
    console.error('Arkadaş silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaş silinirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Gelen arkadaşlık isteklerini listeler
 */
export const getFriendRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const status = req.query.status as string || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Tüm istekleri getir
    const requests = await Friend.getRequests(userId, status);
    
    // Sayfalama için istekleri böl
    const paginatedRequests = requests.slice(skip, skip + limit);
    const totalRequests = requests.length;
    const totalPages = Math.ceil(totalRequests / limit);

    return res.status(200).json({
      success: true,
      data: {
        requests: paginatedRequests,
        pagination: {
          page,
          limit,
          total: totalRequests,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Arkadaşlık istekleri getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlık istekleri getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kullanıcının arkadaşlarını listeler
 */
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // Tüm arkadaşları getir
    const friends = await Friend.getFriends(userId);
    
    // Sayfalama için arkadaşları böl
    const paginatedFriends = friends.slice(skip, skip + limit);
    const totalFriends = friends.length;
    const totalPages = Math.ceil(totalFriends / limit);

    return res.status(200).json({
      success: true,
      data: {
        friends: paginatedFriends,
        pagination: {
          page,
          limit,
          total: totalFriends,
          totalPages
        }
      }
    });
  } catch (error: any) {
    console.error('Arkadaşlar getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlar getirilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * İki kullanıcının arkadaşlık durumunu kontrol eder
 */
export const checkFriendshipStatus = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı ID\'si gereklidir'
      });
    }

    // Arkadaşlık durumunu ve istek durumunu kontrol et
    const isFriend = await Friend.checkFriendship(currentUserId, userId);
    const pendingRequest = await Friend.checkPendingRequest(currentUserId, userId);

    let status = 'none'; // Hiçbir ilişki yok
    let requestInfo = null;

    if (isFriend) {
      status = 'friend'; // Arkadaşlar
    } else if (pendingRequest) {
      status = pendingRequest.sender_id === currentUserId ? 'sent' : 'received'; // İstek gönderilmiş veya alınmış
      requestInfo = pendingRequest;
    }

    return res.status(200).json({
      success: true,
      data: {
        status,
        request: requestInfo
      }
    });
  } catch (error: any) {
    console.error('Arkadaşlık durumu kontrol hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaşlık durumu kontrol edilirken bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Kullanıcı için rastgele arkadaş önerileri getirir
 */
export const getSuggestedFriends = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 5;
    
    // Limit değeri için makul bir sınır koy (1-20 arası)
    const safeLimit = Math.max(1, Math.min(20, limit));
    
    // Arkadaş önerilerini getir
    const suggestedFriends = await Friend.getSuggestedFriends(userId, safeLimit);
    
    return res.status(200).json({
      success: true,
      data: {
        suggestedFriends
      }
    });
  } catch (error: any) {
    console.error('Arkadaş önerileri getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Arkadaş önerileri getirilirken bir hata oluştu',
      error: error.message
    });
  }
}; 