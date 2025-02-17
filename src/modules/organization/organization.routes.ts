import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { OrganizationController } from './organization.controller';
import {
  createOrganizationSchema,
  updateOrganizationSchema,
  getOrganizationSchema,
  deleteOrganizationSchema,
} from './organization.validator';

export const OrganizationRoutes = express.Router();

const organizationCtrl = new OrganizationController();

OrganizationRoutes.post(
  '/organization',
  validateRequest(createOrganizationSchema),
  authGuard,
  organizationCtrl.create,
);

OrganizationRoutes.put(
  '/organization/:organizationId',
  validateRequest(updateOrganizationSchema),
  authGuard,
  organizationCtrl.update,
);

OrganizationRoutes.get(
  '/organization/:organizationId',
  validateRequest(getOrganizationSchema),
  authGuard,
  organizationCtrl.get,
);

OrganizationRoutes.get('/organization', authGuard, organizationCtrl.getAll);

OrganizationRoutes.delete(
  '/organization/:organizationId',
  validateRequest(deleteOrganizationSchema),
  authGuard,
  organizationCtrl.delete,
);

export default OrganizationRoutes;
