const { execSync } = require('child_process');
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000/api';

// Veritabanını temizle ve seed verilerini ekle
async function runSeed() {
  console.log('Veritabanı seed işlemi başlatılıyor...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('Seed işlemi başarıyla tamamlandı!');
    return true;
  } catch (error) {
    console.error('Seed işlemi sırasında hata oluştu:', error.message);
    return false;
  }
}

// Tüm duyuruları getir
async function getAllAnnouncements() {
  try {
    console.log('Tüm duyurular getiriliyor...');
    const response = await fetch(`${BASE_URL}/announcements`);
    const data = await response.json();
    console.log('Toplam duyuru sayısı:', data.data.announcements.length);
    console.log('Duyurular:', JSON.stringify(data.data.announcements, null, 2));
    return data;
  } catch (error) {
    console.error('Duyurular getirilirken hata oluştu:', error.message);
  }
}

// ID'ye göre duyuru getir
async function getAnnouncementById(id) {
  try {
    console.log(`${id} ID'li duyuru getiriliyor...`);
    const response = await fetch(`${BASE_URL}/announcements/${id}`);
    const data = await response.json();
    console.log('Duyuru detayı:', JSON.stringify(data.data.announcement, null, 2));
    return data;
  } catch (error) {
    console.error('Duyuru detayı getirilirken hata oluştu:', error.message);
  }
}

// Testleri çalıştır
async function runTests() {
  console.log('Test işlemi başlatılıyor...');
  console.log('=======================================');

  // 1. Seed işlemini çalıştır
  const seedSuccess = await runSeed();
  if (!seedSuccess) {
    console.error('Seed işlemi başarısız olduğu için testler çalıştırılamadı.');
    return;
  }

  console.log('=======================================');

  // 2. Tüm duyuruları getir
  const allAnnouncements = await getAllAnnouncements();
  
  console.log('=======================================');
  
  // 3. Varsa bir duyuru ID'sini al ve detayını getir
  if (allAnnouncements && allAnnouncements.success && allAnnouncements.data.announcements.length > 0) {
    const firstAnnouncement = allAnnouncements.data.announcements[0];
    await getAnnouncementById(firstAnnouncement.id);
  } else {
    console.log('Duyuru bulunamadığı için ID testi atlanıyor.');
  }

  console.log('=======================================');
  console.log('Test işlemi tamamlandı!');
}

// Ana fonksiyon
async function main() {
  await runTests();
}

main().catch(error => {
  console.error('Ana işlem sırasında hata oluştu:', error);
}); 