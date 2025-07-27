import CryptoJS from 'crypto-js';
const key = process.env.ENCRYPTION_KEY!; // 32-char string

export const encrypt = (plain: string) => CryptoJS.AES.encrypt(plain, key).toString();
export const decrypt = (cipher: string) => CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);