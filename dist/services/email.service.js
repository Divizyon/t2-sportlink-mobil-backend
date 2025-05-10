"use strict";
/**
 * Email servisi
 * Doğrulama e-postaları gönderebilmek için kullanılır
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendVerificationEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Geliştirme ortamında nodemailer ile bir test hesabı oluştur
let transporter;
// Async olarak çalışacak IIFE (Immediately Invoked Function Expression)
(async () => {
    if (process.env.NODE_ENV === 'development') {
        // Geliştirme ortamında ethereal.email kullan
        const testAccount = await nodemailer_1.default.createTestAccount();
        transporter = nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        console.log('Test e-posta hesabı oluşturuldu', {
            user: testAccount.user,
            pass: testAccount.pass,
            previewUrl: 'https://ethereal.email/login'
        });
    }
    else {
        // Üretim ortamında gerçek SMTP ayarlarını kullan
        transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }
})();
/**
 * Doğrulama e-postası gönderir
 * @param email Alıcı e-posta adresi
 * @param verificationCode Doğrulama kodu
 * @returns İşlem başarılı mı?
 */
const sendVerificationEmail = async (email, verificationCode) => {
    try {
        if (!transporter) {
            console.error('E-posta transporter henüz yapılandırılmadı');
            return false;
        }
        // E-posta gönder
        const info = await transporter.sendMail({
            from: `"SportLink" <${process.env.EMAIL_FROM || 'no-reply@sportlink.com'}>`,
            to: email,
            subject: 'E-posta Adresinizi Doğrulayın',
            text: `E-posta adresinizi doğrulamak için kodunuz: ${verificationCode}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #333; text-align: center;">SportLink'e Hoş Geldiniz!</h2>
          <p>Merhaba,</p>
          <p>SportLink'e kaydolduğunuz için teşekkür ederiz. E-posta adresinizi doğrulamak için lütfen aşağıdaki kodu kullanın:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 24px; font-weight: bold; background-color: #f5f5f5; padding: 10px 20px; border-radius: 4px; letter-spacing: 5px;">${verificationCode}</span>
          </div>
          <p>Bu kod 15 dakika boyunca geçerli olacaktır.</p>
          <p>Eğer bu hesabı siz oluşturmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
          <p style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
            &copy; ${new Date().getFullYear()} SportLink. Tüm hakları saklıdır.
          </p>
        </div>
      `
        });
        // Geliştirme ortamında preview URL'i göster
        if (process.env.NODE_ENV === 'development') {
            console.log('E-posta preview URL:', nodemailer_1.default.getTestMessageUrl(info));
        }
        return true;
    }
    catch (error) {
        console.error('E-posta gönderme hatası:', error);
        return false;
    }
};
exports.sendVerificationEmail = sendVerificationEmail;
//# sourceMappingURL=email.service.js.map