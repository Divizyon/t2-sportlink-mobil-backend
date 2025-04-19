import logger from './index';
import fs from 'fs';
import path from 'path';

// Log dizini kontrolü ve oluşturma
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Test log mesajları yazdır
console.log('Test log mesajları oluşturuluyor...');
logger.info('Test info log mesajı');
logger.warn('Test warning log mesajı');
logger.error('Test error log mesajı');
logger.debug('Test debug log mesajı');
logger.http('Test HTTP log mesajı');

// Log dosyalarından içeriği oku
const allLogPath = path.join(logDir, 'all.log');
const errorLogPath = path.join(logDir, 'error.log');

console.log('\nall.log dosyasındaki son 5 satır:');
if (fs.existsSync(allLogPath)) {
  const allLogContent = fs.readFileSync(allLogPath, 'utf8').split('\n').filter(Boolean);
  const lastLines = allLogContent.slice(Math.max(0, allLogContent.length - 5));
  lastLines.forEach(line => console.log(line));
} else {
  console.log('all.log dosyası bulunamadı.');
}

console.log('\nerror.log dosyasındaki son 5 satır:');
if (fs.existsSync(errorLogPath)) {
  const errorLogContent = fs.readFileSync(errorLogPath, 'utf8').split('\n').filter(Boolean);
  const lastLines = errorLogContent.slice(Math.max(0, errorLogContent.length - 5));
  lastLines.forEach(line => console.log(line));
} else {
  console.log('error.log dosyası bulunamadı.');
}

console.log('\nTest tamamlandı.'); 