const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Tüm duyuruları getir
async function getAllAnnouncements() {
  try {
    const response = await fetch(`${BASE_URL}/announcements`);
    const data = await response.json();
    console.log('Tüm Duyurular:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// ID'ye göre duyuru getir
async function getAnnouncementById(id) {
  try {
    const response = await fetch(`${BASE_URL}/announcements/${id}`);
    const data = await response.json();
    console.log('Duyuru Detayı:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

// Testleri çalıştır
async function runTests() {
  console.log('Duyuru API Testleri Başlıyor...');
  console.log('-------------------------------');
  
  // Tüm duyuruları getir
  console.log('Test 1: Tüm duyuruları getir');
  const allAnnouncements = await getAllAnnouncements();
  console.log('-------------------------------');
  
  // Varsa bir duyuru ID'sini al
  let announcementId = null;
  if (allAnnouncements && allAnnouncements.success && allAnnouncements.data.announcements.length > 0) {
    announcementId = allAnnouncements.data.announcements[0].id;
  }
  
  // ID'ye göre duyuru getir (eğer duyuru varsa)
  if (announcementId) {
    console.log(`Test 2: ID'ye göre duyuru getir (ID: ${announcementId})`);
    await getAnnouncementById(announcementId);
    console.log('-------------------------------');
  } else {
    console.log('Test 2: Hiç duyuru bulunamadığı için ID testi atlanıyor');
  }
  
  console.log('Tüm testler tamamlandı!');
}

// Testleri çalıştır
runTests(); 