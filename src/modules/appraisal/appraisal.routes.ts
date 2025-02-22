import { authGuard } from '@/guards';
import { validateRequest } from '@/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createAppraisalSchema,
  updateAppraisalSchema,
  getAppraisalSchema,
  deleteAppraisalSchema,
} from './appraisal.validator';
import { AppraisalController } from './appraisal.controller';

export const AppraisalRoutes = express.Router();

const appraisalCtrl = new AppraisalController();

// Create Appraisal
AppraisalRoutes.post(
  '/appraisal',
  validateRequest(createAppraisalSchema),
  authGuard,
  appraisalCtrl.create,
);

// Update Appraisal
AppraisalRoutes.put(
  '/appraisal/:appraisalId',
  validateRequest(updateAppraisalSchema),
  authGuard,
  appraisalCtrl.update,
);

// Get a Single Appraisal
AppraisalRoutes.get(
  '/appraisal/:appraisalId',
  validateRequest(getAppraisalSchema),
  authGuard,
  appraisalCtrl.get,
);

// Get All Appraisals
AppraisalRoutes.get('/appraisal', authGuard, appraisalCtrl.getAll);

// Delete Appraisal
AppraisalRoutes.delete(
  '/appraisal/:appraisalId',
  validateRequest(deleteAppraisalSchema),
  authGuard,
  appraisalCtrl.delete,
);

export default AppraisalRoutes;
