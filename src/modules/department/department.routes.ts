import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentSchema,
  deleteDepartmentSchema,
} from './department.validator';
import { DepartmentController } from './department.controller';
import { authGuard } from '../../guards';

export const DepartmentRoutes = express.Router();

const departmentController = new DepartmentController();

DepartmentRoutes.post(
  '/department',
  validateRequest(createDepartmentSchema),
  authGuard,
  departmentController.createDepartment,
);

DepartmentRoutes.put(
  '/department/:departmentId',
  validateRequest(updateDepartmentSchema),
  authGuard,
  departmentController.updateDepartment,
);

DepartmentRoutes.get(
  '/department/:departmentId',
  validateRequest(getDepartmentSchema),
  authGuard,
  departmentController.getDepartment,
);

DepartmentRoutes.get(
  '/department',
  authGuard,
  departmentController.getAllDepartment,
);

DepartmentRoutes.delete(
  '/department/:departmentId',
  validateRequest(deleteDepartmentSchema),
  authGuard,
  departmentController.deleteDepartment,
);

export default DepartmentRoutes;
