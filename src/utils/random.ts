/**
 * Belirtilen uzunlukta rastgele bir sayısal kod oluşturur
 * @param length Kod uzunluğu
 * @returns Rastgele sayısal kod
 */
export const generateRandomCode = (length: number): string => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}; 