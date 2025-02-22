import { authGuard } from '@/guards';
import { validateRequest } from '@/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createFileIndexSchema,
  updateFileIndexSchema,
  getFileIndexSchema,
  deleteFileIndexSchema,
} from './fileIndex.validator';
import { FileIndexController } from './fileIndex.controller';

export const FileIndexRoutes = express.Router();

const controller = new FileIndexController();

FileIndexRoutes.post(
  '/file-index',
  validateRequest(createFileIndexSchema),
  authGuard,
  controller.create,
);

FileIndexRoutes.put(
  '/file-index/:fileIndexId',
  validateRequest(updateFileIndexSchema),
  authGuard,
  controller.update,
);

FileIndexRoutes.get(
  '/file-index/:fileIndexId',
  validateRequest(getFileIndexSchema),
  authGuard,
  controller.get,
);

FileIndexRoutes.get('/file-index', authGuard, controller.getAll);

FileIndexRoutes.delete(
  '/file-index/:fileIndexId',
  validateRequest(deleteFileIndexSchema),
  authGuard,
  controller.delete,
);

export default FileIndexRoutes;
