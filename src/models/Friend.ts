import prisma from '../config/prisma';



/**
 * Arkadaşlık modeli
 */
export class Friend {
  /**
   * Arkadaşlık isteği gönderir
   */
  static async sendRequest(senderId: string, receiverId: string) {
    // Kendine arkadaşlık isteği gönderilmesini engelle
    if (senderId === receiverId) {
      throw new Error('Kendine arkadaşlık isteği gönderemezsiniz');
    }

    // Kullanıcıların var olduğunu kontrol et
    const sender = await prisma.user.findUnique({ where: { id: senderId } });
    const receiver = await prisma.user.findUnique({ where: { id: receiverId } });

    if (!sender || !receiver) {
      throw new Error('Kullanıcı bulunamadı');
    }

    // Zaten arkadaş olup olmadıklarını kontrol et
    const existingFriendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            user_id1: senderId,
            user_id2: receiverId
          },
          {
            user_id1: receiverId,
            user_id2: senderId
          }
        ]
      }
    });

    if (existingFriendship) {
      throw new Error('Bu kullanıcı zaten arkadaşınız');
    }

    // Aktif bir istek var mı kontrol et
    const existingRequest = await prisma.friendship_request.findFirst({
      where: {
        OR: [
          {
            sender_id: senderId,
            receiver_id: receiverId,
            status: 'pending'
          },
          {
            sender_id: receiverId,
            receiver_id: senderId,
            status: 'pending'
          }
        ]
      }
    });

    if (existingRequest) {
      throw new Error('Bu kullanıcı için bekleyen bir arkadaşlık isteği zaten mevcut');
    }

    // Yeni istek oluştur
    return prisma.friendship_request.create({
      data: {
        sender: { connect: { id: senderId } },
        receiver: { connect: { id: receiverId } },
        status: 'pending'
      }
    });
  }

  /**
   * Gelen arkadaşlık isteğini kabul eder
   */
  static async acceptRequest(requestId: string, userId: string) {
    // İsteğin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const request = await prisma.friendship_request.findFirst({
      where: {
        id: requestId,
        receiver_id: userId,
        status: 'pending'
      }
    });

    if (!request) {
      throw new Error('Geçerli bir arkadaşlık isteği bulunamadı');
    }

    // İsteği güncelle ve arkadaşlık ilişkisi oluştur
    const [updatedRequest, newFriendship] = await prisma.$transaction([
      // İstek durumunu güncelle
      prisma.friendship_request.update({
        where: { id: requestId },
        data: { status: 'accepted' }
      }),
      // Arkadaşlık ilişkisi oluştur
      prisma.friend.create({
        data: {
          user1: { connect: { id: request.sender_id } },
          user2: { connect: { id: request.receiver_id } }
        }
      })
    ]);

    return { updatedRequest, newFriendship };
  }

  /**
   * Gelen arkadaşlık isteğini reddeder
   */
  static async rejectRequest(requestId: string, userId: string) {
    // İsteğin var olduğunu ve kullanıcıya ait olduğunu kontrol et
    const request = await prisma.friendship_request.findFirst({
      where: {
        id: requestId,
        receiver_id: userId,
        status: 'pending'
      }
    });

    if (!request) {
      throw new Error('Geçerli bir arkadaşlık isteği bulunamadı');
    }

    // İsteği güncelle
    return prisma.friendship_request.update({
      where: { id: requestId },
      data: { status: 'rejected' }
    });
  }

  /**
   * Arkadaş ilişkisini sonlandırır
   */
  static async removeFriend(userId: string, friendId: string) {
    // Arkadaşlık ilişkisinin var olduğunu kontrol et
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            user_id1: userId,
            user_id2: friendId
          },
          {
            user_id1: friendId,
            user_id2: userId
          }
        ]
      }
    });

    if (!friendship) {
      throw new Error('Arkadaşlık ilişkisi bulunamadı');
    }

    // Arkadaşlık ilişkisini sil
    return prisma.friend.delete({
      where: { id: friendship.id }
    });
  }

  /**
   * Kullanıcının tüm arkadaşlık isteklerini getirir
   */
  static async getRequests(userId: string, status: string = 'pending') {
    return prisma.friendship_request.findMany({
      where: {
        receiver_id: userId,
        status
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
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }

  /**
   * Kullanıcının tüm arkadaşlarını getirir
   */
  static async getFriends(userId: string) {
    const friendships = await prisma.friend.findMany({
      where: {
        OR: [
          { user_id1: userId },
          { user_id2: userId }
        ]
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_picture: true
          }
        },
        user2: {
          select: {
            id: true,
            username: true,
            first_name: true,
            last_name: true,
            profile_picture: true
          }
        }
      }
    });

    // Her bir arkadaşlık için mevcut kullanıcı olmayan tarafı döndür
    return friendships.map(friendship => {
      return friendship.user1.id === userId ? friendship.user2 : friendship.user1;
    });
  }

  /**
   * İki kullanıcının arkadaş olup olmadığını kontrol eder
   */
  static async checkFriendship(userId1: string, userId2: string) {
    const friendship = await prisma.friend.findFirst({
      where: {
        OR: [
          {
            user_id1: userId1,
            user_id2: userId2
          },
          {
            user_id1: userId2,
            user_id2: userId1
          }
        ]
      }
    });

    return !!friendship;
  }

  /**
   * İki kullanıcı arasında bekleyen istek olup olmadığını kontrol eder
   */
  static async checkPendingRequest(userId1: string, userId2: string) {
    const request = await prisma.friendship_request.findFirst({
      where: {
        OR: [
          {
            sender_id: userId1,
            receiver_id: userId2,
            status: 'pending'
          },
          {
            sender_id: userId2,
            receiver_id: userId1,
            status: 'pending'
          }
        ]
      }
    });

    return request;
  }
} 