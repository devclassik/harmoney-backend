import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import { PayrollController } from './payroll.controller';
import { createPayrollSchema, updatePayrollSchema, getPayrollSchema, deletePayrollSchema, getAllPayrollsSchema } from './payroll.validator';
import { uploader } from '@/middlewares/uploader';

export const PayrollRoutes = express.Router();

const payrollCtrl = new PayrollController();

PayrollRoutes.post(
    '/payroll',
    validateRequest(createPayrollSchema),
    authGuard,
    payrollCtrl.create,
);

PayrollRoutes.put(
    '/payroll/:id',
    validateRequest(updatePayrollSchema),
    authGuard,
    payrollCtrl.update,
);

PayrollRoutes.get(
    '/payroll/:id',
    validateRequest(getPayrollSchema),
    authGuard,
    payrollCtrl.getOne,
);

PayrollRoutes.get(
    '/payroll',
    validateRequest(getAllPayrollsSchema),
    authGuard,
    payrollCtrl.getAll,
);

PayrollRoutes.delete(
    '/payroll/:id',
    validateRequest(deletePayrollSchema),
    authGuard,
    payrollCtrl.delete,
);

PayrollRoutes.post(
    '/payroll/upload',
    authGuard,
    uploader.single('files'), // up to 10 files
    payrollCtrl.uploadPayrollExcel,
);


export default PayrollRoutes; 