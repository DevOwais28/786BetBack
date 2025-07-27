import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { Express } from 'express-serve-static-core';

// Create uploads directory if it doesn't exist
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads/payment-proofs';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5') * 1024 * 1024; // 5MB default
const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg')
  .split(',')
  .map(type => type.trim());

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Create directory if it doesn't exist
    const fs = require('fs');
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: (_: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `proof-${uniqueSuffix}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only ${ALLOWED_TYPES.join(', ')} are allowed.`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow single file upload
  }
});

// Error handling middleware for file uploads
export const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        message: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` 
      });
    }
    return res.status(400).json({ 
      success: false, 
      message: err.message || 'Error uploading file' 
    });
  } else if (err) {
    // An unknown error occurred
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error during file upload' 
    });
  }
  next();
};

export default upload;