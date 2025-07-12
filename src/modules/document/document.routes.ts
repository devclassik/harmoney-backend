import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import {
    createDocumentSchema,
    deleteDocumentSchema,
    getDocumentSchema,
    updateDocumentSchema,
    getAllDocumentsSchema,
} from './document.validator';
import { DocumentController } from './document.controller';

export const DocumentRoutes = express.Router();

const documentCtrl = new DocumentController();

DocumentRoutes.post(
    '/document',
    validateRequest(createDocumentSchema),
    authGuard,
    documentCtrl.create,
);

DocumentRoutes.put(
    '/document/:id',
    validateRequest(updateDocumentSchema),
    authGuard,
    documentCtrl.update,
);

DocumentRoutes.get(
    '/document/:id',
    validateRequest(getDocumentSchema),
    authGuard,
    documentCtrl.get,
);

DocumentRoutes.get(
    '/document',
    validateRequest(getAllDocumentsSchema),
    authGuard,
    documentCtrl.getAll,
);

DocumentRoutes.delete(
    '/document/:id',
    validateRequest(deleteDocumentSchema),
    authGuard,
    documentCtrl.delete,
);

export default DocumentRoutes; 