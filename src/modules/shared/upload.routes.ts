import express from 'express';
import { UploadController } from './upload.controller';
import { authGuard } from '@/guards';
import { upload } from '../../middlewares/fileUpload.middleware';
import { uploader } from '@/middlewares/uploader';

export const UploadRoutes = express.Router();

const controller = new UploadController();

UploadRoutes.post(
    '/upload/single',
    authGuard,
    uploader.single('file'),
    controller.singleFileUpload,
);

UploadRoutes.post(
    '/upload/multiple',
    authGuard,
    uploader.array('files', 10),
    controller.multipleFileUpload,
);

UploadRoutes.post(
    '/upload/update',
    authGuard,
    uploader.single('file'),
    controller.updateFile,
);

UploadRoutes.delete(
    '/upload/delete',
    authGuard,
    controller.deleteFile,
);


export default UploadRoutes;
