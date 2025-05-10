"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const supabase_1 = require("../config/supabase");
const prisma_1 = __importDefault(require("../config/prisma"));
const dotenv_1 = __importDefault(require("dotenv"));
const library_1 = require("@prisma/client/runtime/library");
dotenv_1.default.config();
exports.authService = {
    /**
     * Kullanıcı kaydı oluşturur
     */
    async register(userData) {
        var _a;
        try {
            // Önce kullanıcının zaten var olup olmadığını kontrol et
            const existingUserByEmail = await prisma_1.default.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUserByEmail) {
                return {
                    success: false,
                    message: 'Bu e-posta adresi zaten kullanılıyor.',
                    code: 'EMAIL_EXISTS'
                };
            }
            const existingUserByUsername = await prisma_1.default.user.findUnique({
                where: { username: userData.username },
            });
            if (existingUserByUsername) {
                return {
                    success: false,
                    message: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçiniz.',
                    code: 'USERNAME_EXISTS'
                };
            }
            // Supabase'de kullanıcı kaydı oluştur ve e-posta doğrulama gönder
            const { error: authError } = await supabase_1.supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        username: userData.username,
                        first_name: userData.first_name,
                        last_name: userData.last_name
                    },
                    // E-posta doğrulama işlemini Supabase yönetecek
                    emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`
                }
            });
            if (authError) {
                if (authError.message.includes('email')) {
                    return {
                        success: false,
                        message: 'Bu e-posta adresi geçersiz veya zaten kullanımda.',
                        code: 'EMAIL_ERROR'
                    };
                }
                if (authError.message.includes('password')) {
                    return {
                        success: false,
                        message: 'Şifre en az 8 karakter uzunluğunda olmalı ve güvenlik kriterlerini karşılamalıdır.',
                        code: 'PASSWORD_ERROR'
                    };
                }
                throw new Error(`Supabase kaydında hata: ${authError.message}`);
            }
            // Prisma ile veritabanında kullanıcı oluştur
            // Supabase'de kullanıcı kimliği ile ilişkilendir
            const user = await prisma_1.default.user.create({
                data: {
                    username: userData.username,
                    email: userData.email,
                    password: '', // Şifreyi Supabase yönettiği için boş bırakıyoruz
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    phone: userData.phone || null,
                    profile_picture: null,
                    default_location_latitude: null,
                    default_location_longitude: null,
                },
            });
            return {
                success: true,
                message: 'Kullanıcı başarıyla kaydedildi. Lütfen e-posta adresinizi doğrulayın.',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                },
            };
        }
        catch (error) {
            // Hata durumunda oluşturulan kullanıcıyı temizle
            await this.cleanupAfterFailedRegistration(userData.email);
            // Prisma hatalarını kullanıcı dostu mesajlara dönüştür
            if (error instanceof library_1.PrismaClientKnownRequestError) {
                // P2002 kodu, unique constraint ihlali hatası
                if (error.code === 'P2002') {
                    const field = (_a = error.meta) === null || _a === void 0 ? void 0 : _a.target;
                    if (field === null || field === void 0 ? void 0 : field.includes('username')) {
                        return {
                            success: false,
                            message: 'Bu kullanıcı adı zaten kullanılıyor. Lütfen başka bir kullanıcı adı seçiniz.',
                            code: 'USERNAME_EXISTS'
                        };
                    }
                    if (field === null || field === void 0 ? void 0 : field.includes('email')) {
                        return {
                            success: false,
                            message: 'Bu e-posta adresi zaten kullanılıyor.',
                            code: 'EMAIL_EXISTS'
                        };
                    }
                    return {
                        success: false,
                        message: 'Girdiğiniz bilgilerde benzersiz olması gereken bir alan zaten kullanılmaktadır.',
                        code: 'UNIQUE_CONSTRAINT_ERROR'
                    };
                }
            }
            return {
                success: false,
                message: 'Kayıt işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'REGISTRATION_ERROR'
            };
        }
    },
    /**
     * Kullanıcı giriş işlemini yapar
     */
    async login(loginData) {
        try {
            // Supabase ile giriş yap
            const { data, error } = await supabase_1.supabase.auth.signInWithPassword({
                email: loginData.email,
                password: loginData.password,
            });
            if (error) {
                // Kullanıcı dostu hata mesajları
                if (error.message.includes("Invalid login credentials")) {
                    return {
                        success: false,
                        message: 'E-posta veya şifre hatalı. Lütfen bilgilerinizi kontrol ediniz.',
                        code: 'INVALID_CREDENTIALS'
                    };
                }
                return {
                    success: false,
                    message: `Giriş başarısız: ${error.message}`,
                    code: 'LOGIN_ERROR'
                };
            }
            // Supabase'den kullanıcının doğrulanma durumunu kontrol et
            if (!data.user.email_confirmed_at) {
                return {
                    success: false,
                    message: 'Lütfen önce e-posta adresinizi doğrulayın',
                    code: 'EMAIL_NOT_VERIFIED'
                };
            }
            // Kullanıcıyı Prisma'dan al
            const user = await prisma_1.default.user.findUnique({
                where: { email: loginData.email },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Kullanıcı bulunamadı',
                    code: 'USER_NOT_FOUND'
                };
            }
            // Başarılı giriş - kullanıcı bilgilerini ve oturum token'ını döndür
            return {
                success: true,
                message: 'Giriş başarılı',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                session: data.session,
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Giriş işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyiniz.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'LOGIN_ERROR'
            };
        }
    },
    /**
     * E-posta doğrulama geri dönüş işleyicisi
     * Bu fonksiyon frontend tarafından çağrılır ve Supabase'den gelen doğrulama bilgisini alır
     */
    async handleEmailVerification(token) {
        try {
            // Supabase'den token'ı doğrula
            const { error } = await supabase_1.supabase.auth.verifyOtp({
                token_hash: token,
                type: 'email',
            });
            if (error) {
                return {
                    success: false,
                    message: `E-posta doğrulama hatası: ${error.message}`,
                    code: 'VERIFICATION_ERROR'
                };
            }
            // Kullanıcı bilgilerini al
            const { data: userData } = await supabase_1.supabase.auth.getUser();
            if (!userData || !userData.user) {
                return {
                    success: false,
                    message: 'Kullanıcı bilgileri alınamadı',
                    code: 'USER_INFO_ERROR'
                };
            }
            // Prisma'daki kullanıcıyı güncelle
            await prisma_1.default.user.update({
                where: { email: userData.user.email },
                data: {
                    email_verified: true,
                },
            });
            return {
                success: true,
                message: 'E-posta adresiniz başarıyla doğrulandı. Şimdi giriş yapabilirsiniz.',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'E-posta doğrulama işlemi sırasında bir hata oluştu.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'VERIFICATION_ERROR'
            };
        }
    },
    /**
     * Başarısız kayıt durumunda temizlik yapar
     */
    async cleanupAfterFailedRegistration(email) {
        try {
            // Prisma'dan kullanıcıyı sil
            await prisma_1.default.user.delete({
                where: { email },
            });
            // Supabase'den kullanıcıyı silmek için ek işlemler gerekebilir
            // Bu kısım gerekirse Supabase admin API'si ile yapılabilir
        }
        catch (error) {
            // Silme işlemi başarısız olursa sessizce devam et
            console.error('Temizlik işlemi sırasında hata:', error);
        }
    },
    /**
     * Kullanıcı çıkış yapar
     */
    async logout() {
        try {
            const { error } = await supabase_1.supabase.auth.signOut();
            if (error) {
                return {
                    success: false,
                    message: `Çıkış başarısız: ${error.message}`,
                    code: 'LOGOUT_ERROR'
                };
            }
            return {
                success: true,
                message: 'Başarıyla çıkış yapıldı',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Çıkış işlemi sırasında bir hata oluştu.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'LOGOUT_ERROR'
            };
        }
    },
    /**
     * Şifre sıfırlama bağlantısı gönderir
     */
    async forgotPassword(email) {
        try {
            // Supabase şifre sıfırlama e-postası gönder
            const { error } = await supabase_1.supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${process.env.FRONTEND_URL}/auth/reset-password`,
            });
            if (error) {
                return {
                    success: false,
                    message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                    code: 'PASSWORD_RESET_ERROR'
                };
            }
            return {
                success: true,
                message: 'Şifre sıfırlama talimatları e-posta adresinize gönderildi.',
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'PASSWORD_RESET_ERROR'
            };
        }
    },
    /**
     * Access token'ı yenilemek için refresh token kullanır
     */
    async refreshToken(refreshData) {
        try {
            // Supabase ile token'ı yenile
            const { data, error } = await supabase_1.supabase.auth.refreshSession({
                refresh_token: refreshData.refresh_token
            });
            if (error) {
                return {
                    success: false,
                    message: 'Oturum yenileme başarısız. Lütfen tekrar giriş yapın.',
                    code: 'REFRESH_TOKEN_ERROR',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                };
            }
            if (!data.session || !data.user) {
                return {
                    success: false,
                    message: 'Oturum bilgileri alınamadı. Lütfen tekrar giriş yapın.',
                    code: 'SESSION_ERROR'
                };
            }
            // Kullanıcı bilgilerini al
            const user = await prisma_1.default.user.findUnique({
                where: { email: data.user.email },
            });
            if (!user) {
                return {
                    success: false,
                    message: 'Kullanıcı bulunamadı',
                    code: 'USER_NOT_FOUND'
                };
            }
            // Yenilenen session bilgilerini döndür
            return {
                success: true,
                message: 'Oturum başarıyla yenilendi',
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                },
                session: data.session
            };
        }
        catch (error) {
            return {
                success: false,
                message: 'Oturum yenileme sırasında bir hata oluştu.',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined,
                code: 'REFRESH_ERROR'
            };
        }
    },
};
//# sourceMappingURL=authService.js.map