import Joi from 'joi';
import { PaymentStatus } from '../../database/entity/Payroll';
import { CreatePayrollDto, UpdatePayrollDto } from './payroll.dto';

export const createPayrollSchema = Joi.object<CreatePayrollDto>({
    payrollId: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
    reference: Joi.string().optional(),
    amount: Joi.number().precision(2).required(),
    employeeId: Joi.number().integer().positive().required(),
});

export const updatePayrollSchema = Joi.object<UpdatePayrollDto>({
    payrollId: Joi.string().optional(),
    status: Joi.string().valid(...Object.values(PaymentStatus)).optional(),
    reference: Joi.string().optional(),
    amount: Joi.number().precision(2).optional(),
    employeeId: Joi.number().integer().positive().optional(),
});

export const getPayrollSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const deletePayrollSchema = Joi.object({
    id: Joi.number().integer().positive().required(),
});

export const getAllPayrollsSchema = Joi.object({}); 