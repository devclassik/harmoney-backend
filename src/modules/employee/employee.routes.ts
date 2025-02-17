import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeSchema,
  updateEmployeeSchema,
} from './employee.validator';
import { EmployeeController } from './employee.controller';

export const EmployeeRoutes = express.Router();

const employeeCtrl = new EmployeeController();

EmployeeRoutes.post(
  '/employee',
  validateRequest(createEmployeeSchema),
  authGuard,
  employeeCtrl.create,
);

EmployeeRoutes.put(
  '/employee/:employeeId',
  validateRequest(updateEmployeeSchema),
  authGuard,
  employeeCtrl.update,
);

EmployeeRoutes.get(
  '/employee/:employeeId',
  validateRequest(getEmployeeSchema),
  authGuard,
  employeeCtrl.get,
);

EmployeeRoutes.get('/employee', authGuard, employeeCtrl.getAll);

EmployeeRoutes.delete(
  '/employee/:employeeId',
  validateRequest(deleteEmployeeSchema),
  authGuard,
  employeeCtrl.delete,
);

export default EmployeeRoutes;
