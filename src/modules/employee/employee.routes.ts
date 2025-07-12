import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { uploader } from '../../middlewares/uploader';
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeSchema,
  updateEmployeeSchema,
  getAllEmployeesSchema,
  bulkUploadSchema,
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

EmployeeRoutes.get('/employee', validateRequest(getAllEmployeesSchema), authGuard, employeeCtrl.getAll);

EmployeeRoutes.delete(
  '/employee/:employeeId',
  validateRequest(deleteEmployeeSchema),
  authGuard,
  employeeCtrl.delete,
);


EmployeeRoutes.post(
  '/employee/bulk-upload',
  validateRequest(bulkUploadSchema),
  authGuard,
  uploader.single('file'), // Single Excel file
  employeeCtrl.bulkUploadEmployees,
);

EmployeeRoutes.get(
  '/employee/bulk-upload/success-report',
  authGuard,
  employeeCtrl.downloadSuccessReport,
);

export default EmployeeRoutes;
