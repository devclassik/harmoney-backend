import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { AccommodationController } from './accommodation.controller';
import {
  createAccommodationSchema,
  updateAccommodationSchema,
  getAccommodationSchema,
  deleteAccommodationSchema,
} from './accommodation.validator';

export const AccommodationRoutes = express.Router();

const accommodationCtrl = new AccommodationController();

AccommodationRoutes.post(
  '/accommodation',
  validateRequest(createAccommodationSchema),
  authGuard,
  accommodationCtrl.create,
);

AccommodationRoutes.put(
  '/accommodation/:accommodationId',
  validateRequest(updateAccommodationSchema),
  authGuard,
  accommodationCtrl.update,
);

AccommodationRoutes.get(
  '/accommodation/:accommodationId',
  validateRequest(getAccommodationSchema),
  authGuard,
  accommodationCtrl.get,
);

AccommodationRoutes.get('/accommodation', authGuard, accommodationCtrl.getAll);

AccommodationRoutes.delete(
  '/accommodation/:accommodationId',
  validateRequest(deleteAccommodationSchema),
  authGuard,
  accommodationCtrl.delete,
);

export default AccommodationRoutes;
