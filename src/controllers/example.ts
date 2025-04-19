import logger from '../utils/logger';
import { measureExecutionTime, tryCatchWithLog, maskSensitiveInfo } from '../utils/logger/helpers';
import { ApiError } from '../middlewares/error-handler';
import { RequestHandler } from '../types/middleware';

// Örnek veri alım işlemi
export const getData: RequestHandler = async (req, res, next) => {
  try {
    // İstek parametrelerini loglama
    logger.debug('Veri alma isteği alındı', { 
      params: req.params,
      query: req.query,
      requestId: req.id
    });

    // Performans ölçümüyle işlemleri gerçekleştirme
    const result = await measureExecutionTime('Örnek veri işleme', async () => {
      // Burada veri işleme mantığı olacak
      // Örnek olarak gecikme simüle edelim
      await new Promise(resolve => setTimeout(resolve, 200));
      
      return {
        success: true,
        data: {
          id: '12345',
          name: 'Örnek Veri',
          timestamp: new Date().toISOString()
        }
      };
    }, 'info'); // İşlem süresini info seviyesinde logla

    // Başarılı yanıt
    logger.info('Veri başarıyla alındı', { requestId: req.id });
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// Örnek veri oluşturma işlemi
export const createData: RequestHandler = async (req, res, next) => {
  try {
    // Hassas verileri gizleyerek loglama
    const maskedBody = maskSensitiveInfo(JSON.stringify(req.body));
    logger.debug(`Veri oluşturma isteği: ${maskedBody}`, { requestId: req.id });

    // Veri doğrulama (örnek)
    if (!req.body.name) {
      logger.warn('Geçersiz veri gönderildi', { requestId: req.id, body: maskedBody });
      throw new ApiError('İsim alanı zorunludur', 400);
    }

    // Veri işleme (örnek)
    const newData = {
      id: Date.now().toString(),
      name: req.body.name,
      createdAt: new Date().toISOString()
    };

    // İşlem başarılı logu
    logger.info('Yeni veri oluşturuldu', { 
      requestId: req.id,
      dataId: newData.id 
    });

    res.status(201).json({
      success: true,
      data: newData
    });
  } catch (error) {
    next(error);
  }
};

// Hata olasılığı olan işlem örneği
export const riskyOperation: RequestHandler = async (req, res, next) => {
  try {
    // tryCatchWithLog kullanarak bir işlemi güvenli şekilde çalıştırma
    const result = await tryCatchWithLog(
      async () => {
        // Rastgele hata fırlatabilecek bir işlem
        if (Math.random() > 0.5) {
          throw new Error('Rastgele işlem hatası');
        }
        return { status: 'success', value: Math.floor(Math.random() * 100) };
      },
      { status: 'error', value: 0 }, // Hata durumunda dönecek varsayılan değer
      'Riskli operasyon başarısız oldu' // Hata log mesajı
    );

    if (result.status === 'error') {
      logger.warn('İşlem başarısız oldu ama kurtarıldı', { requestId: req.id });
    } else {
      logger.info('Riskli işlem başarıyla tamamlandı', { requestId: req.id, value: result.value });
    }

    res.status(200).json({
      success: true,
      result
    });
  } catch (error) {
    next(error);
  }
};
