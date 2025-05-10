"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateHaversineDistance = exports.calculateBulkDistances = exports.calculateDistance = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
// Çevre değişkenlerini yükle
dotenv_1.default.config();
// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_DISTANCE_API_KEY || 'AIzaSyAjnjZl3Cty3U1JB3PYBATBH6ujuHk5c3A';
/**
 * İki konum arasındaki mesafeyi hesaplar (Google Distance Matrix API)
 *
 * @param origin Başlangıç koordinatları
 * @param destination Varış koordinatları
 * @param mode Ulaşım modu
 * @returns Mesafe ve süre bilgisi
 */
const calculateDistance = async (origin, destination, mode = 'driving') => {
    try {
        const originStr = `${origin.latitude},${origin.longitude}`;
        const destStr = `${destination.latitude},${destination.longitude}`;
        const response = await axios_1.default.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`);
        // API yanıtını kontrol et
        if (response.data.status !== 'OK') {
            throw new Error(`Google API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`);
        }
        const element = response.data.rows[0].elements[0];
        return {
            distance: element.distance,
            duration: element.duration,
            status: element.status
        };
    }
    catch (error) {
        console.error('Distance calculation error:', error);
        throw error;
    }
};
exports.calculateDistance = calculateDistance;
/**
 * Bir noktadan birden çok noktaya mesafeleri toplu olarak hesaplar
 *
 * @param origin Başlangıç koordinatları
 * @param destinations Varış noktaları listesi (id, lat, lng)
 * @param mode Ulaşım modu
 * @returns Her bir varış noktası için mesafe ve süre bilgisi
 */
const calculateBulkDistances = async (origin, destinations, mode = 'driving') => {
    try {
        if (!destinations.length) {
            return {
                success: false,
                results: [],
                error_message: 'No destinations provided'
            };
        }
        // Koordinat formatını standartlaştır
        const originLat = 'latitude' in origin ? origin.latitude : origin.lat;
        const originLng = 'longitude' in origin ? origin.longitude : origin.lng;
        const originStr = `${originLat},${originLng}`;
        // Hedeflerin koordinatlarını standartlaştır
        const standardizedDestinations = destinations.map(dest => ({
            id: dest.id,
            latitude: dest.latitude || dest.lat,
            longitude: dest.longitude || dest.lng
        }));
        const destinationStrs = standardizedDestinations.map(dest => `${dest.latitude},${dest.longitude}`);
        const destinationsStr = destinationStrs.join('|');
        const response = await axios_1.default.get(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationsStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`);
        // API yanıtını kontrol et
        if (response.data.status !== 'OK') {
            return {
                success: false,
                results: [],
                error_message: `Google API error: ${response.data.status} - ${response.data.error_message || 'Unknown error'}`
            };
        }
        // Her bir varış noktası için sonuçları hazırla
        const results = standardizedDestinations.map((dest, index) => {
            const element = response.data.rows[0].elements[index];
            if (element.status !== 'OK') {
                return {
                    id: dest.id,
                    latitude: dest.latitude,
                    longitude: dest.longitude,
                    status: element.status
                };
            }
            return {
                id: dest.id,
                latitude: dest.latitude,
                longitude: dest.longitude,
                distance: element.distance.value, // metre cinsinden
                distanceText: element.distance.text,
                duration: element.duration.value, // saniye cinsinden
                durationText: element.duration.text,
                status: element.status
            };
        });
        return {
            success: true,
            results,
            origin_address: response.data.origin_addresses[0],
            destination_addresses: response.data.destination_addresses
        };
    }
    catch (error) {
        console.error('Bulk distance calculation error:', error);
        return {
            success: false,
            results: [],
            error_message: error instanceof Error ? error.message : 'Unknown error occurred'
        };
    }
};
exports.calculateBulkDistances = calculateBulkDistances;
/**
 * İki konum arasındaki mesafeyi hesaplar (Haversine formülü ile)
 *
 * Not: Bu fonksiyon kuş uçuşu mesafeyi hesaplar, gerçek yol mesafesini değil.
 * API çağrısı yapmadan hızlı bir tahmin için kullanılabilir.
 *
 * @param lat1 Başlangıç enlemi
 * @param lon1 Başlangıç boylamı
 * @param lat2 Varış enlemi
 * @param lon2 Varış boylamı
 * @returns Kilometre cinsinden mesafe
 */
const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Kilometre cinsinden mesafe
    return parseFloat(distance.toFixed(2));
};
exports.calculateHaversineDistance = calculateHaversineDistance;
/**
 * Derece cinsinden değeri radyana çevirir
 *
 * @param deg Derece
 * @returns Radyan
 */
const toRad = (deg) => {
    return deg * Math.PI / 180;
};
//# sourceMappingURL=maps.util.js.map