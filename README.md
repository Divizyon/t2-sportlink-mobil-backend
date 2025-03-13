# SportLink Mobil Backend

Bu proje, SportLink mobil uygulaması için RESTful API backend hizmetini sağlar.

## Teknolojiler

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Docker

## Kurulum

### Gereksinimler

- Node.js (v16+)
- npm veya yarn
- PostgreSQL (veya Docker)

### Adımlar

1. Repoyu klonlayın:
   ```bash
   git clone https://github.com/your-username/t2-sportlink-mobil-backend.git
   cd t2-sportlink-mobil-backend
   ```

2. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

3. Çevre değişkenlerini ayarlayın:
   ```bash
   cp .env.example .env
   # .env dosyasını düzenleyin
   ```

4. Geliştirme modunda çalıştırın:
   ```bash
   npm run dev
   # veya
   yarn dev
   ```

## Kullanım

API, varsayılan olarak `http://localhost:3000/api/v1` adresinde çalışır.

### API Endpointleri

- `GET /api/v1/health` - API sağlık kontrolü
- `POST /api/v1/auth/register` - Kullanıcı kaydı
- `POST /api/v1/auth/login` - Kullanıcı girişi
- `GET /api/v1/users` - Kullanıcıları listele
- `GET /api/v1/users/:id` - Kullanıcı detaylarını getir

Daha fazla bilgi için API dokümantasyonuna bakın.

## Geliştirme

### Komutlar

- `npm run dev` - Geliştirme sunucusunu başlatır
- `npm run build` - Projeyi derler
- `npm start` - Derlenmiş uygulamayı çalıştırır
- `npm run lint` - Kod kalitesini kontrol eder
- `npm run format` - Kodu formatlar
- `npm test` - Testleri çalıştırır

### Klasör Yapısı

```
src/
├── config/         # Yapılandırma dosyaları
├── controllers/    # İstek işleyicileri
├── middlewares/    # Express ara yazılımları
├── models/         # Veri modelleri
├── routes/         # Rota tanımları
├── services/       # İş mantığı
├── types/          # TypeScript tip tanımları
├── utils/          # Yardımcı fonksiyonlar
└── app.ts          # Express uygulama kurulumu
```

## Docker ile Çalıştırma

```bash
# Docker imajını oluşturun
docker build -t sportlink-backend .

# Konteyneri çalıştırın
docker run -p 3000:3000 sportlink-backend
```

## Lisans

Bu proje [MIT lisansı](LICENSE) altında lisanslanmıştır. 