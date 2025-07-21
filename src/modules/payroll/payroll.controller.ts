import { AppDataSource } from '../../database';
import { Payroll } from '../../database/entity/Payroll';
import { BaseController } from '../shared/base.controller';

export class PayrollController extends BaseController<Payroll> {
    constructor() {
        super(AppDataSource.getRepository(Payroll));
    }
} 