import { Router } from 'express';
import * as exampleController from '../controllers/example';
import logger from '../utils/logger';
import { Middleware } from '../types/middleware';

const router = Router();

// Middleware - tüm example route'ları için
router.use(((req, _res, next) => {
  logger.debug('Example route erişildi', { 
    path: req.path, 
    method: req.method,
    requestId: req.id 
  });
  next();
}) as Middleware);

// Route tanımları
router.get('/', exampleController.getData);
router.post('/', exampleController.createData);
router.get('/risky', exampleController.riskyOperation);

// Hata loglama testi için örnek route
router.get('/error-test', ((req, _res, next) => {
  logger.debug('Hata test rotası çağrıldı', { requestId: req.id });
  try {
    throw new Error('Test hatası - bilinçli oluşturuldu');
  } catch (error) {
    logger.error('Hata oluştu', { error: (error as Error).message });
    next(error);
  }
}) as Middleware);

export default router;
