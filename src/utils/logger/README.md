# SportLink Loglama Sistemi

Bu klasör, SportLink Mobil Backend uygulaması için loglama altyapısını içerir. Hem Winston hem de Pino loglama kütüphaneleri yapılandırılmıştır ve ihtiyaçlarınıza göre birini seçebilirsiniz.

## Özellikler

- Çoklu loglama kütüphaneleri desteği (Winston ve Pino)
- Ortak bir loglama arayüzü
- Loglama seviyelerine göre filtreleme
- Hem konsol hem de dosya loglama
- Hata izleme ve detaylı hata logları
- HTTP istekleri için otomatik loglama middleware'i
- İstek ID'leri ile istek izleme
- Ortama göre otomatik konfigürasyon (geliştirme/üretim)
- Performans ölçüm yardımcıları
- Hata yakalama ve güvenli işlem yardımcıları
- Hassas veri maskeleme
- Periyodik sistem metrik loglaması
- Temiz uygulama kapatma işlemleri

## Kullanım

### Temel Kullanım

```typescript
import logger from '../utils/logger';

// Farklı loglama seviyeleri
logger.error('Bir hata oluştu', { errorCode: 500 });
logger.warn('Dikkat edilmesi gereken bir durum');
logger.info('Bilgilendirme mesajı');
logger.http('HTTP isteği bilgisi');
logger.debug('Hata ayıklama için detaylı bilgi');
```

### Express Middleware Kullanımı

```typescript
import express from 'express';
import { httpLogger } from '../utils/logger';

const app = express();

// Tüm istekler için loglama middleware'i
app.use(httpLogger);
```

### Hata Yakalama

```typescript
import { errorHandler } from '../middlewares/error-handler';

// En son middleware olarak ekleyin
app.use(errorHandler);
```

### Yardımcı Araçları Kullanma

```typescript
import { 
  measureExecutionTime, 
  tryCatchWithLog, 
  withTimeout,
  maskSensitiveInfo, 
  limitArrayForLogging,
  startPeriodicMetricsLogging
} from '../utils/logger/helpers';

// Fonksiyon çalışma süresini ölçme
async function getData() {
  return await measureExecutionTime('Veri getirme', async () => {
    // Veri getirme işlemleri
    return { /* veriler */ };
  });
}

// Güvenli işlem çalıştırma
async function safeDatabaseOperation() {
  return await tryCatchWithLog(
    async () => { /* veritabanı işlemi */ },
    { status: 'error' }, // Hata durumunda varsayılan değer
    'Veritabanı işlemi başarısız oldu' // Hata log mesajı
  );
}

// Zaman aşımı ile işlem
async function fetchWithTimeout() {
  return await withTimeout(
    async () => { /* uzun sürebilecek işlem */ },
    5000 // 5 saniye zaman aşımı
  );
}

// Sistem metrikleri loglaması başlatma
const stopLogging = startPeriodicMetricsLogging(60000); // Her dakika

// Uygulama kapatılırken
function shutdown() {
  stopLogging(); // Metrik loglamasını durdurma
}
```

## Konfigürasyon

Loglama davranışı, `.env` dosyasında aşağıdaki değişkenlerle özelleştirilebilir:

- `LOGGER_TYPE`: Kullanılacak loglama kütüphanesi (`winston` veya `pino`, varsayılan: `winston`)
- `LOG_LEVEL`: Loglama seviyesi (`error`, `warn`, `info`, `http`, `debug`, varsayılan: geliştirme ortamında `debug`, üretim ortamında `info`)
- `NODE_ENV`: Ortam ayarı (`development` veya `production`)

## Log Dosya Yapısı

Loglar `logs/` dizinine kaydedilir:

- `all.log`: Tüm loglama seviyelerindeki mesajları içerir
- `error.log`: Sadece hata seviyesindeki mesajları içerir

## Winston ve Pino Arasındaki Farklar

### Winston
- Daha eski ve yaygın bir kütüphane
- Esnek transport sistemi
- Daha fazla özelleştirme seçeneği
- Bazı senaryolarda daha yavaş olabilir

### Pino
- Yüksek performanslı, asenkron loglama
- JSON çıktı formatı
- Daha az bellek kullanımı
- Daha basit API

## Özel bir Loglayıcı Kullanımı

Özel durumlarda her iki loglayıcıya da doğrudan erişim mümkündür:

```typescript
import { winstonLogger, pinoLogger } from '../utils/logger';

// Winston ile doğrudan loglama
winstonLogger.info('Winston ile özel loglama');

// Pino ile doğrudan loglama
pinoLogger.info('Pino ile özel loglama');
```

## Uygulama Kapatma İşlemleri

Uygulama kapatma işlemlerini uygun şekilde ele almak için app.ts'de örnek bir konfigürasyon bulunmaktadır:

```typescript
// Temiz kapatma işlevi
const gracefulShutdown = () => {
  logger.info("Uygulama kapatılıyor...");
  
  // Metrik loglamasını durdur
  stopMetricsLogging();
  
  // HTTP sunucusunu kapat
  server.close(() => {
    logger.info("HTTP sunucusu kapatıldı");
    process.exit(0);
  });
  
  // Zaman aşımı güvenlik önlemi
  setTimeout(() => {
    logger.error("Kapatma işlemi zaman aşımına uğradı, zorla kapatılıyor");
    process.exit(1);
  }, 10000);
};

// Kapatma sinyallerini dinle
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
``` 