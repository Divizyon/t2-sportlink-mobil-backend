import logger from './index';
import { performance } from 'perf_hooks';

/**
 * Bir fonksiyonun çalışma süresini ölçmek için kullanılan yardımcı fonksiyon.
 * Fonksiyonu çağırır, süreyi ölçer ve sonucu döndürür.
 *
 * @param name - Ölçümlenen fonksiyonun adı
 * @param fn - Ölçümlenecek asenkron fonksiyon
 * @param logLevel - Ölçüm sonucunu loglamak için kullanılacak seviye (varsayılan: debug)
 * @returns Fonksiyonun döndürdüğü değer
 */
export async function measureExecutionTime<T>(
  name: string,
  fn: () => Promise<T>,
  logLevel: 'debug' | 'info' | 'warn' | 'error' = 'debug'
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const duration = performance.now() - start;
    logger[logLevel](`${name} fonksiyonu ${duration.toFixed(2)}ms sürdü`);
  }
}

/**
 * Bir fonksiyonu çalıştırır ve herhangi bir hata durumunu yakalar.
 * Hata durumunda hatayı loglar ve istenen varsayılan değeri döndürür.
 *
 * @param fn - Çalıştırılacak fonksiyon
 * @param defaultValue - Hata durumunda döndürülecek varsayılan değer
 * @param errorMessage - Log mesajı (varsayılan: 'İşlem sırasında hata oluştu')
 * @returns Fonksiyonun sonucu veya hata durumunda varsayılan değer
 */
export async function tryCatchWithLog<T>(
  fn: () => Promise<T>,
  defaultValue: T,
  errorMessage = 'İşlem sırasında hata oluştu'
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    logger.error(errorMessage, { error: (error as Error).message, stack: (error as Error).stack });
    return defaultValue;
  }
}

/**
 * Fonksiyonu belirli bir süre içinde çalıştırmayı dener
 * Zaman aşımı durumunda hata fırlatır
 *
 * @param fn - Zaman aşımı ile çalıştırılacak fonksiyon
 * @param timeoutMs - Zaman aşımı süresi (ms)
 * @returns Fonksiyonun sonucu
 */
export function withTimeout<T>(fn: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`İşlem ${timeoutMs}ms içinde tamamlanamadı`));
    }, timeoutMs);

    fn()
      .then((result) => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Belirtilen aralıklarla metrik bilgilerini loglayan fonksiyon
 * @param intervalMs - Loglama aralığı (ms)
 * @returns Zamanlayıcıyı durdurmak için fonksiyon
 */
export function startPeriodicMetricsLogging(intervalMs = 60000): () => void {
  const interval = setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    logger.info('Sistem metrikleri', {
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB`,
      },
      cpu: {
        user: `${Math.round(cpuUsage.user / 1000)} ms`,
        system: `${Math.round(cpuUsage.system / 1000)} ms`,
      },
      uptime: `${Math.round(process.uptime())} saniye`,
    });
  }, intervalMs);

  // Temizleme fonksiyonunu döndür
  return () => clearInterval(interval);
}

/**
 * Belirli bir string içindeki hassas verileri gizler
 * @param text - Gizlenecek metni içeren string
 * @param patterns - Gizlenecek regex desenleri ve etiketleri
 * @returns Hassas verileri gizlenmiş string
 */
export function maskSensitiveInfo(
  text: string,
  patterns: Array<{ regex: RegExp; label: string }> = [
    { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, label: '[EMAIL]' },
    { regex: /\b(?:\d[ -]*?){13,16}\b/g, label: '[CARD_NUMBER]' },
    { regex: /password["']?\s*:\s*["']?[^"',\s]+/gi, label: 'password: "[HIDDEN]"' },
  ]
): string {
  let maskedText = text;
  patterns.forEach(({ regex, label }) => {
    maskedText = maskedText.replace(regex, label);
  });
  return maskedText;
}

/**
 * Bir log mesajına dizi veriler (array) eklemeden önce sayılarını sınırlar
 * @param items - Sınırlanacak dizi
 * @param limit - Maksimum eleman sayısı
 * @returns Sınırlanmış dizi
 */
export function limitArrayForLogging<T>(items: T[], limit = 10): T[] | { items: T[]; total: number } {
  if (items.length <= limit) {
    return items;
  }
  
  return {
    items: items.slice(0, limit),
    total: items.length,
  };
} 