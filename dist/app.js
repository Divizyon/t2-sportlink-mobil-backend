"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable prettier/prettier */
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const friendRoutes_1 = __importDefault(require("./routes/friendRoutes"));
const messageRoutes_1 = __importDefault(require("./routes/messageRoutes"));
const sportRoutes_1 = __importDefault(require("./routes/sportRoutes"));
const newsRoutes_1 = __importDefault(require("./routes/newsRoutes"));
const announcementRoutes_1 = __importDefault(require("./routes/announcementRoutes"));
const notificationRoutes_1 = __importDefault(require("./routes/notificationRoutes"));
const deviceRoutes_1 = __importDefault(require("./routes/deviceRoutes"));
const mapsRoutes_1 = __importDefault(require("./routes/mapsRoutes"));
const supabase_1 = require("./config/supabase");
const userService_1 = require("./services/userService");
// Çevre değişkenlerini yükle
dotenv_1.default.config();
// Express uygulamasını oluştur
const app = (0, express_1.default)();
// Temel Middleware
app.use((0, cors_1.default)());
app.use((0, helmet_1.default)());
// TypeScript hatası nedeniyle compression fonksiyonunu bu şekilde uyguluyoruz
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('dev'));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 dakika
    limit: 1000, // IP başına istek limiti - artırıldı
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});
app.use(limiter);
// Ana rota
app.get('/', (_, res) => {
    res.json({
        success: true,
        message: 'SportLink API çalışıyor!',
        version: '1.0.0'
    });
});
// API rotalarını bağla
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/events', eventRoutes_1.default);
app.use('/api/friends', friendRoutes_1.default);
app.use('/api/messages', messageRoutes_1.default);
app.use('/api/sports', sportRoutes_1.default);
app.use('/api/news', newsRoutes_1.default);
app.use('/api/announcements', announcementRoutes_1.default);
app.use('/api/notifications', notificationRoutes_1.default);
app.use('/api/devices', deviceRoutes_1.default);
app.use('/api/maps', mapsRoutes_1.default);
// 404 handler
app.use((_, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint bulunamadı',
        code: 'NOT_FOUND'
    });
});
// Hata işleyici
//a 
app.use((err, _, res, __) => {
    console.error('Sunucu hatası:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Sunucu hatası oluştu',
        code: err.code || 'SERVER_ERROR',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
const PORT = process.env.PORT || 3000;
// Supabase realtime özelliklerini başlat
(0, supabase_1.setupRealtimeTables)()
    .then(() => console.log('Supabase realtime yapılandırması başarıyla tamamlandı'))
    .catch((err) => console.error('Supabase realtime yapılandırması başarısız:', err));
// Zamanlanmış görevler
// Süresi geçmiş etkinlikleri otomatik güncelleme görevi
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1 saat (milisaniye cinsinden)
setInterval(async () => {
    try {
        await userService_1.userService.updateExpiredEvents();
    }
    catch (error) {
        // Hata durumunda sadece hata mesajını logla
        console.error('Etkinlik güncelleme görevi hatası:', error);
    }
}, UPDATE_INTERVAL);
// Uygulama başlatıldığında ilk kez etkinlikleri güncelle
(async () => {
    try {
        await userService_1.userService.updateExpiredEvents();
    }
    catch (error) {
        // Hata durumunda sadece hata mesajını logla
        console.error('İlk etkinlik güncellemesi hatası:', error);
    }
})();
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
});
exports.default = app;
//# sourceMappingURL=app.js.map