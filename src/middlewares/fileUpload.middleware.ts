import multer from 'multer';
import path from 'path';
import fs from 'fs';


// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.originalUrl.split('/').pop();
    const uploadPath = `uploads/${folder}s/`;

    fs.mkdirSync(uploadPath, { recursive: true });

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter (only accept PDFs, DOCX, and Excel files)
const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    'image/bmp',
    'image/tiff',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', // .xls files
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx files
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files and documents (PDF, DOCX, Excel) are allowed!'), false);
  }
};

export const upload = multer({ storage, fileFilter });
