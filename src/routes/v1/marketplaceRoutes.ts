import express from 'express';
import { MarketplaceController } from '../../controllers';
import { authGuard } from '../../guards';

export const MarketplaceRoutes = express.Router();

const marketplaceController = new MarketplaceController();

MarketplaceRoutes.get(
  '/marketplace/providers/:category',
  authGuard,
  marketplaceController.fetchProviders,
);

MarketplaceRoutes.get(
  '/marketplace/providers/:category/services/:businessId',
  authGuard,
  marketplaceController.fetchProviderServices,
);
