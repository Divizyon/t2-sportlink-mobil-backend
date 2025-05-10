/**
 * Email servisi
 * Doğrulama e-postaları gönderebilmek için kullanılır
 */
/**
 * Doğrulama e-postası gönderir
 * @param email Alıcı e-posta adresi
 * @param verificationCode Doğrulama kodu
 * @returns İşlem başarılı mı?
 */
export declare const sendVerificationEmail: (email: string, verificationCode: string) => Promise<boolean>;
