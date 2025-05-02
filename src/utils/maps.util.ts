import axios from 'axios';
import dotenv from 'dotenv';

// Çevre değişkenlerini yükle
dotenv.config();

// Google Maps API anahtarı
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_DISTANCE_API_KEY || 'AIzaSyAjnjZl3Cty3U1JB3PYBATBH6ujuHk5c3A';

// Mesafe yanıt tipi
export interface DistanceResult {
  distance: {
    text: string;  // "5.2 km" gibi
    value: number; // metre cinsinden (5200)
  };
  duration: {
    text: string;  // "12 dakika" gibi
    value: number; // saniye cinsinden (720)
  };
  status: string;
}

// Toplu mesafe hesaplama yanıt tipi
export interface BulkDistancesResult {
  success: boolean;
  results: Array<{
    id: string;
    latitude: number;
    longitude: number;
    distance?: number; // metre cinsinden mesafe
    distanceText?: string; // "5.2 km" gibi
    duration?: number; // saniye cinsinden süre
    durationText?: string; // "12 dakika" gibi
    status: string;
  }>;
  origin_address?: string;
  destination_addresses?: string[];
  error_message?: string;
}

/**
 * İki konum arasındaki mesafeyi hesaplar (Google Distance Matrix API)
 * 
 * @param origin Başlangıç koordinatları
 * @param destination Varış koordinatları
 * @param mode Ulaşım modu
 * @returns Mesafe ve süre bilgisi
 */
export const calculateDistance = async (
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number },
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<DistanceResult> => {
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
    );

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
  } catch (error) {
    console.error('Distance calculation error:', error);
    throw error;
  }
};

/**
 * Bir noktadan birden çok noktaya mesafeleri toplu olarak hesaplar
 * 
 * @param origin Başlangıç koordinatları
 * @param destinations Varış noktaları listesi (id, lat, lng)
 * @param mode Ulaşım modu
 * @returns Her bir varış noktası için mesafe ve süre bilgisi
 */
export const calculateBulkDistances = async (
  origin: { lat: number; lng: number } | { latitude: number; longitude: number },
  destinations: Array<{ id: string; lat?: number; lng?: number; latitude?: number; longitude?: number }>,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
): Promise<BulkDistancesResult> => {
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
    
    const destinationStrs = standardizedDestinations.map(dest => 
      `${dest.latitude},${dest.longitude}`
    );
    const destinationsStr = destinationStrs.join('|');

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destinationsStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`
    );

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
          latitude: dest.latitude as number,
          longitude: dest.longitude as number,
          status: element.status
        };
      }
      
      return {
        id: dest.id,
        latitude: dest.latitude as number,
        longitude: dest.longitude as number,
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
  } catch (error) {
    console.error('Bulk distance calculation error:', error);
    return {
      success: false,
      results: [],
      error_message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

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
export const calculateHaversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Dünya yarıçapı (km)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Kilometre cinsinden mesafe
  
  return parseFloat(distance.toFixed(2));
};

/**
 * Derece cinsinden değeri radyana çevirir
 * 
 * @param deg Derece
 * @returns Radyan
 */
const toRad = (deg: number): number => {
  return deg * Math.PI / 180;
}; 