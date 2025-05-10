"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBulkDistances = exports.getDistance = void 0;
const maps_util_1 = require("../utils/maps.util");
/**
 * İki konum arasındaki mesafeyi hesaplar
 */
const getDistance = async (req, res) => {
    try {
        const { originLat, originLng, destLat, destLng, mode = 'driving' } = req.query;
        // Parametreleri kontrol et
        if (!originLat || !originLng || !destLat || !destLng) {
            return res.status(400).json({
                success: false,
                message: 'Başlangıç ve bitiş koordinatları gereklidir'
            });
        }
        // String'den sayıya çevir
        const origin = {
            latitude: parseFloat(originLat),
            longitude: parseFloat(originLng)
        };
        const destination = {
            latitude: parseFloat(destLat),
            longitude: parseFloat(destLng)
        };
        // Geçersiz koordinatları kontrol et
        if (isNaN(origin.latitude) || isNaN(origin.longitude) ||
            isNaN(destination.latitude) || isNaN(destination.longitude)) {
            return res.status(400).json({
                success: false,
                message: 'Geçersiz koordinat değerleri'
            });
        }
        // Mesafeyi hesapla
        const result = await (0, maps_util_1.calculateDistance)(origin, destination, mode);
        // Sonucu döndür
        return res.json({
            success: true,
            data: {
                distance: result.distance,
                duration: result.duration,
                status: result.status
            }
        });
    }
    catch (error) {
        console.error('Mesafe hesaplama hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Mesafe hesaplanırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getDistance = getDistance;
/**
 * Bir konumdan birden çok konuma olan mesafeleri toplu hesaplar
 */
const getBulkDistances = async (req, res) => {
    try {
        const { origin, destinations, mode = 'driving' } = req.body;
        // Parametreleri kontrol et
        if (!origin || !destinations || !Array.isArray(destinations) || destinations.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Geçerli bir başlangıç noktası ve en az bir varış noktası gereklidir'
            });
        }
        // Her bir hedef için id kontrolü yap
        for (const dest of destinations) {
            if (!dest.id || (!dest.latitude && !dest.lat) || (!dest.longitude && !dest.lng)) {
                return res.status(400).json({
                    success: false,
                    message: 'Her varış noktası için id, latitude/lat ve longitude/lng değerleri gereklidir'
                });
            }
        }
        // Toplu mesafe hesaplama
        const result = await (0, maps_util_1.calculateBulkDistances)(origin, destinations, mode);
        // Sonucu döndür
        return res.json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('Toplu mesafe hesaplama hatası:', error);
        return res.status(500).json({
            success: false,
            message: 'Mesafeler hesaplanırken bir hata oluştu',
            error: error.message
        });
    }
};
exports.getBulkDistances = getBulkDistances;
//# sourceMappingURL=mapsController.js.map