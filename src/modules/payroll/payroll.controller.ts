import { AppDataSource, Employee, Payroll } from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import { PaymentStatus } from '../../database/entity/Payroll';
import { MESSAGES } from '../../utils';
import XLSX from 'xlsx';

export class PayrollController {
    private payrollRepo = AppDataSource.getRepository(Payroll);
    private employeeRepo = AppDataSource.getRepository(Employee);
    private baseService = new BaseService(AppDataSource.getRepository(Payroll));

    public create = async (req: Request, res: Response): Promise<Response> => {
        const { payrollId, status, reference, amount, employeeId } = req.body;

        try {
            if (payrollId) {
                await this.baseService.isPropertyTaken('payrollId', payrollId, 'Payroll ID');
            }

            const employee = await this.employeeRepo.findOne({ where: { id: employeeId } });
            if (!employee) {
                return this.baseService.notFoundResponse(res, 'Employee');
            }

            const payroll = this.payrollRepo.create({
                payrollId,
                status: status || PaymentStatus.INITIALIZED,
                reference,
                amount,
                employee
            });

            const data = await this.payrollRepo.save(payroll);
            return await this.baseService.createdResponse(res, data);
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };

    public update = async (req: Request, res: Response): Promise<Response> => {
        const payrollId = Number(req.params.id);
        const updateData = req.body;

        try {
            const payroll = await this.baseService.findById({
                id: payrollId,
                resource: 'Payroll',
                relations: ['employee']
            });

            if (updateData.employeeId) {
                const employee = await this.employeeRepo.findOne({ where: { id: updateData.employeeId } });
                if (!employee) {
                    return this.baseService.notFoundResponse(res, 'Employee');
                }
                updateData.employee = employee;
                delete updateData.employeeId;
            }

            const data = await this.payrollRepo.save({ ...payroll, ...updateData });
            return this.baseService.updatedResponse(res, data);
        } catch (error) {
            return this.baseService.errorResponse(res, error);
        }
    };

    public getOne = async (req: Request, res: Response): Promise<Response> => {
        const payrollId = Number(req.params.id);

        try {
            const payroll = await this.baseService.findById({
                id: payrollId,
                resource: 'Payroll',
                relations: ['employee']
            });

            return this.baseService.successResponse(res, payroll);
        } catch (error) {
            return this.baseService.errorResponse(res, error);
        }
    };

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        try {
            await this.baseService.findAll({
                res,
                relations: ['employee']
            });
            return res;
        } catch (error) {
            return this.baseService.errorResponse(res, error);
        }
    };

    public delete = async (req: Request, res: Response): Promise<Response | void> => {
        const payrollId = Number(req.params.id);

        try {
            await this.baseService.delete({
                id: payrollId,
                resource: 'Payroll',
                res
            });
        } catch (error) {
            return this.baseService.errorResponse(res, error);
        }
    };

    public uploadPayrollExcel = async (req: Request, res: Response): Promise<Response> => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            // Parse Excel file from buffer
            const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet);

            const results = [];
            const errors = [];

            for (const row of rows) {
                const { payrollId, status, reference, amount, employeeId } = row as any;
                if (!employeeId) {
                    errors.push({ row, error: 'Missing employeeId' });
                    continue;
                }
                const employee = await this.employeeRepo.findOne({ where: { id: Number(employeeId) } });
                if (!employee) {
                    errors.push({ row, error: `Employee with id ${employeeId} not found` });
                    continue;
                }
                try {
                    const payroll = this.payrollRepo.create({
                        payrollId: payrollId?.toString(),
                        status: status || undefined,
                        reference: reference?.toString(),
                        amount: amount ? Number(amount) : 0,
                        employee,
                    });
                    const saved = await this.payrollRepo.save(payroll);
                    results.push(saved);
                } catch (err) {
                    errors.push({ row, error: err.message });
                }
            }
            return res.status(201).json({ message: 'Payroll upload complete', created: results.length, errors, data: results });
        } catch (error) {
            return res.status(500).json({ message: 'Failed to process payroll Excel', error: error.message });
        }
    };

} 