# SportLink Mobil Uygulama

## 1. SportLink Nedir?
Konya'da spor yapmayı seven bireylerin, takım arkadaşları veya antrenman partnerleri bulması genellikle zor ve zaman alıcı bir süreçtir. Mevcut spor toplulukları genellikle kapalı gruplardan oluşmakta ve yeni bireylerin bu gruplara katılması kolay olmamaktadır. Ayrıca, şehirde düzenlenen spor etkinlikleri, turnuvalar veya antrenman buluşmaları farklı platformlarda duyurulduğundan dolayı katılımcıların etkinliklerden haberdar olması zorlaşmaktadır.

Bu nedenle, SportLink, Konya'daki spor severlerin belirli spor dallarında takım arkadaşı veya antrenman partneri bulmasını kolaylaştıran bir mobil platform olarak tasarlanmıştır. Kullanıcılar, basketbol, futbol, e-spor, bisiklet, masa tenisi ve tenis gibi branşlarda etkinlikler oluşturabilir, var olan etkinliklere katılabilir ve kendileriyle benzer ilgi alanlarına sahip sporcuları keşfedebilir.

Ayrıca, Konya'daki spor haberleri ve etkinlik duyuruları sistemde otomatik olarak toplanarak kullanıcılara güncel bilgiler sunulacaktır. GPS ve harita entegrasyonu sayesinde kullanıcılar, kendi lokasyonlarına en uygun spor etkinliklerini hızlıca bulabileceklerdir.

## 2. Mobil Uygulama Özellikleri ve API Endpointleri

### 2.1. Kullanıcı Yönetimi
- **Kayıt ve Giriş İşlemleri**
  - `POST /api/auth/register`: Kullanıcı kaydı
  - `POST /api/auth/login`: Kullanıcı girişi
  - `POST /api/auth/logout`: Çıkış yapma
  - `POST /api/auth/forgot-password`: Şifre sıfırlama
  - `POST /api/auth/verify-email`: E-posta doğrulama

- **Profil Yönetimi**
  - `GET /api/users/profile`: Kullanıcı profil bilgilerini görüntüleme
  - `PUT /api/users/profile`: Profil bilgilerini güncelleme
  - `PUT /api/users/profile/sports`: İlgilenilen spor dallarını güncelleme
  - `PUT /api/users/profile/avatar`: Profil fotoğrafı yükleme/güncelleme
  - `GET /api/users/:userId`: Başka bir kullanıcının profilini görüntüleme

### 2.2. Etkinlik Yönetimi
- **Etkinlik Oluşturma ve Katılım**
  - `POST /api/events`: Yeni etkinlik oluşturma
  - `GET /api/events`: Etkinlikleri listeleme (filtreleme özellikleriyle)
  - `GET /api/events/:eventId`: Etkinlik detaylarını görüntüleme
  - `PUT /api/events/:eventId`: Etkinlik bilgilerini güncelleme (sadece oluşturan)
  - `DELETE /api/events/:eventId`: Etkinliği silme (sadece oluşturan)
  - `POST /api/events/:eventId/join`: Etkinliğe katılma
  - `POST /api/events/:eventId/leave`: Etkinlikten ayrılma
  - `GET /api/events/my`: Kullanıcının katıldığı etkinlikleri listeleme
  - `GET /api/events/created`: Kullanıcının oluşturduğu etkinlikleri listeleme

- **Etkinlik Filtreleme ve Arama**
  - `GET /api/events/nearby`: Yakındaki etkinlikleri bulma (konum bazlı)
  - `GET /api/events/search`: Etkinlik arama (spor türü, tarih, konum vb. parametrelerle)
  - `GET /api/events/recommended`: Kullanıcıya özel önerilen etkinlikler

- **Etkinlik Değerlendirme**
  - `POST /api/events/:eventId/rate`: Etkinlik sonrası değerlendirme
  - `GET /api/events/:eventId/ratings`: Etkinlik değerlendirmelerini görüntüleme

### 2.3. Sosyal Özellikler
- **Arkadaşlık ve Takip Sistemi**
  - `POST /api/friends/request/:userId`: Arkadaşlık isteği gönderme
  - `PUT /api/friends/accept/:requestId`: Arkadaşlık isteğini kabul etme
  - `PUT /api/friends/reject/:requestId`: Arkadaşlık isteğini reddetme
  - `GET /api/friends`: Arkadaş listesini görüntüleme
  - `GET /api/friends/requests`: Gelen arkadaşlık isteklerini görüntüleme



### 2.4. Bildirim Sistemi
- **Bildirim Yönetimi**
  - `GET /api/notifications`: Bildirimleri listeleme
  - `PUT /api/notifications/:notificationId/read`: Bildirimi okundu olarak işaretleme
  - `PUT /api/notifications/settings`: Bildirim ayarlarını güncelleme

### 2.5. Spor Haberleri ve Duyurular
- **Haber ve Duyuru Yönetimi**
  - `GET /api/news`: Spor haberlerini listeleme
  - `GET /api/news/:newsId`: Haber detayını görüntüleme
  - `GET /api/announcements`: Duyuruları listeleme
  - `GET /api/announcements/:announcementId`: Duyuru detayını görüntüleme

### 2.6. Konum ve Harita Entegrasyonu
- **Konum Servisleri**
  - `GET /api/locations/sports-facilities`: Yakındaki spor tesislerini listeleme
  - `GET /api/locations/events`: Harita üzerinde etkinlikleri görüntüleme
  - `POST /api/locations/current`: Kullanıcının mevcut konumunu güncelleme
