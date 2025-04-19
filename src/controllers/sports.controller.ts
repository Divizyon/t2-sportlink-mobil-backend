import { Request, Response } from 'express';
import { sportsService, CreateSportDTO, UpdateSportDTO } from '../services/sports.service';

/**
 * Tüm sporları getir
 */
export const getAllSports = async (_req: Request, res: Response) => {
  try {
    const sports = await sportsService.findAll();
    
    return res.status(200).json({
      success: true,
      message: 'Sporlar başarıyla getirildi.',
      data: sports
    });
  } catch (error) {
    console.error('Spor listesi getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * ID'ye göre spor getir
 */
export const getSportById = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    
    const sport = await sportsService.findById(id);
    
    if (!sport) {
      return res.status(404).json({
        success: false,
        message: 'Spor bulunamadı.'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Spor başarıyla getirildi.',
      data: sport
    });
  } catch (error) {
    console.error('Spor getirme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Yeni spor oluştur
 */
export const createSport = async (req: Request, res: Response) => {
  try {
    const sportData: CreateSportDTO = req.body;
    
    // Spor isminin benzersiz olduğunu kontrol et
    const existingSport = await sportsService.findByName(sportData.name);
    if (existingSport) {
      return res.status(409).json({
        success: false,
        message: 'Bu isimde bir spor zaten mevcut.'
      });
    }
    
    const newSport = await sportsService.create(sportData);
    
    return res.status(201).json({
      success: true,
      message: 'Spor başarıyla oluşturuldu.',
      data: newSport
    });
  } catch (error) {
    console.error('Spor oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Spor güncelle
 */
export const updateSport = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    const sportData: UpdateSportDTO = req.body;
    
    // Spor varlığını kontrol et
    const existingSport = await sportsService.findById(id);
    if (!existingSport) {
      return res.status(404).json({
        success: false,
        message: 'Spor bulunamadı.'
      });
    }
    
    // İsim güncelleniyor ve yeni isim başka bir sporla çakışıyor mu kontrol et
    if (sportData.name && sportData.name !== existingSport.name) {
      const nameExists = await sportsService.findByName(sportData.name);
      if (nameExists) {
        return res.status(409).json({
          success: false,
          message: 'Bu isimde bir spor zaten mevcut.'
        });
      }
    }
    
    const updatedSport = await sportsService.update(id, sportData);
    
    return res.status(200).json({
      success: true,
      message: 'Spor başarıyla güncellendi.',
      data: updatedSport
    });
  } catch (error) {
    console.error('Spor güncelleme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
};

/**
 * Spor sil
 */
export const deleteSport = async (req: Request, res: Response) => {
  try {
    const id = BigInt(req.params.id);
    
    // Spor varlığını kontrol et
    const existingSport = await sportsService.findById(id);
    if (!existingSport) {
      return res.status(404).json({
        success: false,
        message: 'Spor bulunamadı.'
      });
    }
    
    await sportsService.delete(id);
    
    return res.status(200).json({
      success: true,
      message: 'Spor başarıyla silindi.'
    });
  } catch (error) {
    console.error('Spor silme hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası.'
    });
  }
}; 