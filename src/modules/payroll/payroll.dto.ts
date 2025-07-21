import { PaymentStatus } from '../../database/entity/Payroll';

export interface CreatePayrollDto {
    payrollId?: string;
    status?: PaymentStatus;
    reference?: string;
    amount: number;
    employeeId: number;
}

export interface UpdatePayrollDto extends Partial<CreatePayrollDto> { } 