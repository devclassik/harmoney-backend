import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { AnalyticsController } from './analytics.controller';
import { getStatSchema, getPerformanceStatSchema } from './analytics.validator';

export const AnalyticsRoutes = express.Router();

const controller = new AnalyticsController();

AnalyticsRoutes.get('/analytics/overview', authGuard, controller.overview);

AnalyticsRoutes.get(
  '/analytics/leave-stat',
  validateRequest(getStatSchema),
  authGuard,
  controller.getLeaveStat,
);

AnalyticsRoutes.get(
  '/analytics/employee-demographics',
  authGuard,
  controller.getEmployeeDemographics,
);

AnalyticsRoutes.get(
  '/analytics/performance-stat',
  validateRequest(getPerformanceStatSchema),
  authGuard,
  controller.getAppraisalScores,
);

AnalyticsRoutes.get(
  '/analytics/discipline-stat',
  validateRequest(getStatSchema),
  authGuard,
  controller.getDisciplineStat,
);

export default AnalyticsRoutes;
