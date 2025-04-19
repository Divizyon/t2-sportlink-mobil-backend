import { Request, Response } from 'express';
import { eventsService, CreateEventDTO, UpdateEventDTO, EventQueryParams } from '../services/events.service';

/**
 * Tüm etkinlikleri getir (filtreleme desteğiyle)
 */
export const getAllEvents = async (req: Request, res: Response) => {
  try {
    // Query parametrelerini işle
    const queryParams: EventQueryParams = {};
    
    if (req.query.sport_id) queryParams.sport_id = BigInt(req.query.sport_id as string);
    if (req.query.creator_id) queryParams.creator_id = BigInt(req.query.creator_id as string);
    if (req.query.location_name) queryParams.location_name = req.query.location_name as string;
    if (req.query.status) queryParams.status = req.query.status as string;
    
    if (req.query.min_date) queryParams.min_date = new Date(req.query.min_date as string);
    if (req.query.max_date) queryParams.max_date = new Date(req.query.max_date as string);
    
    if (req.query.latitude) queryParams.latitude = parseFloat(req.query.latitude as string);
    if (req.query.longitude) queryParams.longitude = parseFloat(req.query.longitude as string);
    if (req.query.distance) queryParams.distance = parseFloat(req.query.distance as string);
    
    const events = await eventsService.findAll(queryParams);
    
    return res.status(200).json({
      success: true,
      message: 'Etkinlikler başarıyla getirildi.',
      data: events
    });
  } catch (error) {
    console.error('Etkinlik listesi getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * ID'ye göre etkinlik getir
 */
export const getEventById = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    
    const event = await eventsService.findById(id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla getirildi.',
      data: event
    });
  } catch (error) {
    console.error('Etkinlik getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Yeni etkinlik oluştur
 */
export const createEvent = async (req: Request, res: Response) => {
  try {
    const eventData: CreateEventDTO = {
      ...req.body,
      creator_id: BigInt(req.body.creator_id),
      sport_id: BigInt(req.body.sport_id),
      event_date: new Date(req.body.event_date),
      start_time: new Date(req.body.start_time),
      end_time: new Date(req.body.end_time)
    };
    
    const newEvent = await eventsService.create(eventData);
    
    // Etkinlik oluşturan kullanıcıyı otomatik olarak katılımcı olarak ekle
    await eventsService.addParticipant(newEvent.id, eventData.creator_id, 'organizer');
    
    return res.status(201).json({
      success: true,
      message: 'Etkinlik başarıyla oluşturuldu.',
      data: newEvent
    });
  } catch (error) {
    console.error('Etkinlik oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Etkinlik güncelle
 */
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const eventData: UpdateEventDTO = req.body;
    
    // Etkinlik varlığını kontrol et
    const existingEvent = await eventsService.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    // Date tipindeki alanları dönüştür
    if (eventData.event_date) eventData.event_date = new Date(eventData.event_date);
    if (eventData.start_time) eventData.start_time = new Date(eventData.start_time);
    if (eventData.end_time) eventData.end_time = new Date(eventData.end_time);
    
    const updatedEvent = await eventsService.update(id, eventData);
    
    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla güncellendi.',
      data: updatedEvent
    });
  } catch (error) {
    console.error('Etkinlik güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Etkinlik sil
 */
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    
    // Etkinlik varlığını kontrol et
    const existingEvent = await eventsService.findById(id);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    await eventsService.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Etkinlik başarıyla silindi.'
    });
  } catch (error) {
    console.error('Etkinlik silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Etkinliğe katılımcı ekle
 */
export const joinEvent = async (req: Request, res: Response) => {
  try {
    const eventId = BigInt(req.params.id);
    const userId = BigInt(req.body.user_id);
    
    // Etkinlik varlığını kontrol et
    const existingEvent = await eventsService.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    // Etkinliğin dolu olup olmadığını kontrol et
    if (existingEvent.participants.length >= existingEvent.max_participants) {
      return res.status(400).json({
        success: false,
        message: 'Etkinlik katılımcı kapasitesi dolu.'
      });
    }
    
    // Kullanıcının zaten katılımcı olup olmadığını kontrol et
    const isAlreadyParticipant = existingEvent.participants.some((p: { user_id: BigInt }) => p.user_id === userId);
    if (isAlreadyParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı zaten bu etkinliğe katılıyor.'
      });
    }
    
    await eventsService.addParticipant(eventId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Etkinliğe başarıyla katılım sağlandı.'
    });
  } catch (error) {
    console.error('Etkinliğe katılma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Etkinlikten ayrıl
 */
export const leaveEvent = async (req: Request, res: Response) => {
  try {
    const eventId = BigInt(req.params.id);
    const userId = BigInt(req.body.user_id);
    
    // Etkinlik varlığını kontrol et
    const existingEvent = await eventsService.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    // Kullanıcının katılımcı olup olmadığını kontrol et
    const participant = existingEvent.participants.find((p: { user_id: BigInt; role: string }) => p.user_id === userId);
    if (!participant) {
      return res.status(400).json({
        success: false,
        message: 'Kullanıcı bu etkinliğe katılmıyor.'
      });
    }
    
    // Kullanıcı organizatör ise etkinlikten ayrılamaz
    if (participant.role === 'organizer') {
      return res.status(400).json({
        success: false,
        message: 'Organizatör etkinlikten ayrılamaz.'
      });
    }
    
    await eventsService.removeParticipant(eventId, userId);
    
    return res.status(200).json({
      success: true,
      message: 'Etkinlikten başarıyla ayrıldınız.'
    });
  } catch (error) {
    console.error('Etkinlikten ayrılma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Etkinliğe değerlendirme ekle
 */
export const rateEvent = async (req: Request, res: Response) => {
  try {
    const eventId = BigInt(req.params.id);
    const userId = BigInt(req.body.user_id);
    const { rating, review } = req.body;
    
    // Etkinlik varlığını kontrol et
    const existingEvent = await eventsService.findById(eventId);
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Etkinlik bulunamadı.'
      });
    }
    
    // Kullanıcının etkinliğe katılmış olduğunu kontrol et
    const isParticipant = existingEvent.participants.some((p: { user_id: BigInt }) => p.user_id === userId);
    if (!isParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Sadece etkinliğe katılan kullanıcılar değerlendirme yapabilir.'
      });
    }
    
    // Derecelendirme aralığını kontrol et (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Değerlendirme 1 ile 5 arasında olmalıdır.'
      });
    }
    
    await eventsService.addRating(eventId, userId, rating, review);
    
    return res.status(201).json({
      success: true,
      message: 'Değerlendirmeniz başarıyla eklendi.'
    });
  } catch (error) {
    console.error('Etkinlik değerlendirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
}; 