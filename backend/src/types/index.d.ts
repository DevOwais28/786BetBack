// Global type declarations for missing modules
declare module 'crypto-js' {
  export interface WordArray {
    toString(encoder?: any): string;
  }

  export interface CipherParams {
    ciphertext: WordArray;
    key: WordArray;
    iv: WordArray;
    salt: WordArray;
    algorithm: any;
    mode: any;
    padding: any;
    blockSize: number;
    formatter: any;
  }

  export interface CryptoJSStatic {
    AES: {
      encrypt(message: string, key: string | WordArray): CipherParams;
      decrypt(ciphertext: string | CipherParams, key: string | WordArray): WordArray;
    };
    enc: {
      Utf8: {
        stringify(wordArray: WordArray): string;
      };
    };
  }

  const CryptoJS: CryptoJSStatic;
  export default CryptoJS;
}

// Fix for Express Multer namespace
declare global {
  namespace Express {
    interface Multer {
      File: {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination: string;
        filename: string;
        path: string;
        buffer: Buffer;
      }
    }
  }
}
