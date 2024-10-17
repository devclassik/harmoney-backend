import express from 'express';
import { BusinessController } from '../../controllers';
import { authGuard, businessGuard } from '../../guards';

export const BusinessRoutes = express.Router();

const businessController = new BusinessController();

BusinessRoutes.patch(
  '/business/profile',
  authGuard,
  businessGuard,
  businessController.updateBusinessProfile,
);

BusinessRoutes.put(
  '/business/bank',
  authGuard,
  businessGuard,
  businessController.updateBusinessBank,
);

BusinessRoutes.post(
  '/business/service',
  authGuard,
  businessGuard,
  businessController.createService,
);

BusinessRoutes.get(
  '/business/services',
  authGuard,
  businessGuard,
  businessController.fetchServices,
);

BusinessRoutes.patch(
  '/business/service',
  authGuard,
  businessGuard,
  businessController.updateService,
);

BusinessRoutes.delete(
  '/business/service',
  authGuard,
  businessGuard,
  businessController.deleteService,
);

BusinessRoutes.post(
  '/business/location',
  authGuard,
  businessGuard,
  businessController.createLocation,
);

BusinessRoutes.get(
  '/business/locations',
  authGuard,
  businessGuard,
  businessController.fetchLocations,
);

BusinessRoutes.patch(
  '/business/location',
  authGuard,
  businessGuard,
  businessController.updateLocation,
);

BusinessRoutes.delete(
  '/business/location',
  authGuard,
  businessGuard,
  businessController.deleteLocation,
);
