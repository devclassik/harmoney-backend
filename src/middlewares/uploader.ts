import multer from 'multer';
import { Request } from 'express';

// Memory storage keeps file in memory buffer (not on disk)
const storage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: any) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', // .xls files
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

export const uploader = multer({ storage });
