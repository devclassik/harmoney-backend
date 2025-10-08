import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { TemplateController } from './template.controller';
import { upload } from '../../middlewares/fileUpload.middleware';
import {
  createTemplateSchema,
  updateTemplateSchema,
  getTemplateSchema,
  deleteTemplateSchema,
} from './template.validator';
import { uploader } from '@/middlewares/uploader';

export const TemplateRoutes = express.Router();

const templateCtrl = new TemplateController();

TemplateRoutes.post(
  '/template',
  authGuard,
  upload.single('file'),
  validateRequest(createTemplateSchema),
  templateCtrl.create,
);

TemplateRoutes.post(
  '/template-upload',
  authGuard,
  uploader.single('file'),
  validateRequest(createTemplateSchema),
  templateCtrl.upload,
);

// TemplateRoutes.put(
//   '/template/:templateId',
//   authGuard,
//   upload.single('file'),
//   validateRequest(updateTemplateSchema),
//   templateCtrl.update,
// );

TemplateRoutes.put(
  '/template/:templateId',
  authGuard,
  uploader.single('file'),
  validateRequest(updateTemplateSchema),
  templateCtrl.updateTemplate,
);

TemplateRoutes.get(
  '/template/:templateId',
  authGuard,
  validateRequest(getTemplateSchema),
  templateCtrl.get,
);

TemplateRoutes.get('/template', authGuard, templateCtrl.getAll);

TemplateRoutes.delete(
  '/template/:templateId',
  authGuard,
  validateRequest(deleteTemplateSchema),
  templateCtrl.delete,
);

export default TemplateRoutes;
