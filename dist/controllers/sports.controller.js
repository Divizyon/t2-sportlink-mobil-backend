"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSport = exports.updateSport = exports.createSport = exports.getSportById = exports.getAllSports = void 0;
const sports_service_1 = require("../services/sports.service");
/**
 * Tüm sporları getir
 */
const getAllSports = async (_req, res) => {
    try {
        const sports = await sports_service_1.sportsService.findAll();
        return res.status(200).json({
            success: true,
            message: 'Sporlar başarıyla getirildi.',
            data: sports
        });
    }
    catch (error) {
        console.error('Spor listesi getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.getAllSports = getAllSports;
/**
 * ID'ye göre spor getir
 */
const getSportById = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        const sport = await sports_service_1.sportsService.findById(id);
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
    }
    catch (error) {
        console.error('Spor getirme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.getSportById = getSportById;
/**
 * Yeni spor oluştur
 */
const createSport = async (req, res) => {
    try {
        const sportData = req.body;
        // Spor isminin benzersiz olduğunu kontrol et
        const existingSport = await sports_service_1.sportsService.findByName(sportData.name);
        if (existingSport) {
            return res.status(409).json({
                success: false,
                message: 'Bu isimde bir spor zaten mevcut.'
            });
        }
        const newSport = await sports_service_1.sportsService.create(sportData);
        return res.status(201).json({
            success: true,
            message: 'Spor başarıyla oluşturuldu.',
            data: newSport
        });
    }
    catch (error) {
        console.error('Spor oluşturma hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.createSport = createSport;
/**
 * Spor güncelle
 */
const updateSport = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        const sportData = req.body;
        // Spor varlığını kontrol et
        const existingSport = await sports_service_1.sportsService.findById(id);
        if (!existingSport) {
            return res.status(404).json({
                success: false,
                message: 'Spor bulunamadı.'
            });
        }
        // İsim güncelleniyor ve yeni isim başka bir sporla çakışıyor mu kontrol et
        if (sportData.name && sportData.name !== existingSport.name) {
            const nameExists = await sports_service_1.sportsService.findByName(sportData.name);
            if (nameExists) {
                return res.status(409).json({
                    success: false,
                    message: 'Bu isimde bir spor zaten mevcut.'
                });
            }
        }
        const updatedSport = await sports_service_1.sportsService.update(id, sportData);
        return res.status(200).json({
            success: true,
            message: 'Spor başarıyla güncellendi.',
            data: updatedSport
        });
    }
    catch (error) {
        console.error('Spor güncelleme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.updateSport = updateSport;
/**
 * Spor sil
 */
const deleteSport = async (req, res) => {
    try {
        const id = BigInt(req.params.id);
        // Spor varlığını kontrol et
        const existingSport = await sports_service_1.sportsService.findById(id);
        if (!existingSport) {
            return res.status(404).json({
                success: false,
                message: 'Spor bulunamadı.'
            });
        }
        await sports_service_1.sportsService.delete(id);
        return res.status(200).json({
            success: true,
            message: 'Spor başarıyla silindi.'
        });
    }
    catch (error) {
        console.error('Spor silme hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Sunucu hatası.'
        });
    }
};
exports.deleteSport = deleteSport;
//# sourceMappingURL=sports.controller.js.map