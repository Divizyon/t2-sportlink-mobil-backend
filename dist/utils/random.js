"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRandomCode = void 0;
/**
 * Belirtilen uzunlukta rastgele bir sayısal kod oluşturur
 * @param length Kod uzunluğu
 * @returns Rastgele sayısal kod
 */
const generateRandomCode = (length) => {
    let result = '';
    const characters = '0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.generateRandomCode = generateRandomCode;
//# sourceMappingURL=random.js.map