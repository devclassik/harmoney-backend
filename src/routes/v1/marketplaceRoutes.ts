import express from 'express';
import { MarketplaceController } from '../../controllers';
import { authGuard, trnxPinGuard } from '../../guards';

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

MarketplaceRoutes.get(
  '/marketplace/vas/:vasIdentifier',
  authGuard,
  marketplaceController.getVasItems,
);

MarketplaceRoutes.get(
  '/marketplace/vas/:serviceId/plans',
  authGuard,
  marketplaceController.fetchVasItemPlans,
);

MarketplaceRoutes.post(
  '/marketplace/vas/verify',
  authGuard,
  marketplaceController.verifyPowerOrCableTvData,
);

MarketplaceRoutes.post(
  '/marketplace/purchase/airtime',
  authGuard,
  trnxPinGuard,
  marketplaceController.purchaseAirtime,
);

MarketplaceRoutes.post(
  '/marketplace/purchase/data',
  authGuard,
  trnxPinGuard,
  marketplaceController.purchaseData,
);

MarketplaceRoutes.post(
  '/marketplace/purchase/cabletv',
  authGuard,
  trnxPinGuard,
  marketplaceController.purchaseCabletv,
);

MarketplaceRoutes.post(
  '/marketplace/purchase/utility',
  authGuard,
  trnxPinGuard,
  marketplaceController.purchaseUtility,
);

MarketplaceRoutes.post(
  '/marketplace/purchase/internet',
  // authGuard,
  // trnxPinGuard,
  marketplaceController.purchaseInternet,
);
