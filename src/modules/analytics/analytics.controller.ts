import {
  AppDataSource,
  Appraisal,
  Discipline,
  Employee,
  Leave,
} from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import {
  DisciplineTypes,
  DurationUnit,
  EmployeeStatus,
  Genders,
  LeaveTypes,
} from '@/database/enum';
import { getDuration } from '@/utils/helper';
import { MONTHS, QUARTERLY_MONTHS } from '@/utils';

export class AnalyticsController {
  private leaveRepo = AppDataSource.getRepository(Leave);
  private disciplineRepo = AppDataSource.getRepository(Discipline);
  private appraisalRepo = AppDataSource.getRepository(Appraisal);
  private employeeRepo = AppDataSource.getRepository(Employee);
  private baseService = new BaseService(AppDataSource.getRepository(Employee));

  public overview = async (req: Request, res: Response): Promise<Response> => {
    try {
      const [
        totalEmployees,
        activeEmployees,
        employeesOnLeave,
        employeesOnDiscipline,
      ] = await Promise.all([
        this.employeeRepo.count(),
        this.employeeRepo.count({
          where: { employeeStatus: EmployeeStatus.ACTIVE },
        }),
        this.employeeRepo.count({
          where: { employeeStatus: EmployeeStatus.ON_LEAVE },
        }),
        this.employeeRepo.count({
          where: { employeeStatus: EmployeeStatus.ON_DISCIPLINE },
        }),
      ]);

      return await this.baseService.createdResponse(res, {
        totalEmployees,
        activeEmployees,
        employeesOnLeave,
        employeesOnDiscipline,
      });
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public getLeaveStat = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { year, status } = req.query;
    const selectedYear = year || new Date().getFullYear();

    let query = await this.leaveRepo
      .createQueryBuilder('leave')
      .select([
        "TO_CHAR(leave.startDate, '%Y-%m') as month",
        'leave.type as type',
        'COUNT(leave.id) as count',
      ])
      .where('YEAR(leave.startDate) = :selectedYear', { selectedYear })
      .where('leave.startDate IS NOT NULL')
      .andWhere('leave.deletedAt IS NULL');
    if (status) {
      query = query.andWhere('leave.status = :status', { status });
    }
    const leaveData = await query
      .groupBy('month, leave.type')
      .orderBy('month', 'ASC')
      .getRawMany();

    const leaveTypes = Object.values(LeaveTypes);

    const chartData = MONTHS.map((month, index) => {
      const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;

      const monthData = leaveData.filter((d) => d.month === monthKey);

      return {
        month,
        ...Object.fromEntries(leaveTypes.map((type) => [type, 0])),
        ...Object.fromEntries(
          monthData.map((d) => [d.type, parseInt(d.count, 10)]),
        ),
      };
    });

    return await this.baseService.createdResponse(res, chartData);
  };

  public getDisciplineStat = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { year, status } = req.query;
    const selectedYear = year || new Date().getFullYear();

    let query = this.disciplineRepo
      .createQueryBuilder('discipline')
      .select([
        "TO_CHAR(discipline.createdAt, '%Y-%m') as month",
        'discipline.disciplineType as type',
        'COUNT(discipline.id) as count',
      ])
      .where('YEAR(discipline.createdAt) = :selectedYear', { selectedYear })
      .where('discipline.createdAt IS NOT NULL')
      .andWhere('discipline.deletedAt IS NULL');
    if (status) {
      query = query.andWhere('discipline.status = :status', { status });
    }
    const leaveData = await query
      .groupBy('month, discipline.disciplineType')
      .orderBy('month', 'ASC')
      .getRawMany();

    const disciplineTypes = Object.values(DisciplineTypes);

    const chartData = MONTHS.map((month, index) => {
      const monthKey = `${selectedYear}-${String(index + 1).padStart(2, '0')}`;

      const monthData = leaveData.filter((d) => d.month === monthKey);

      return {
        month,
        ...Object.fromEntries(disciplineTypes.map((type) => [type, 0])),
        ...Object.fromEntries(
          monthData.map((d) => [d.type, parseInt(d.count, 10)]),
        ),
      };
    });

    return await this.baseService.createdResponse(res, chartData);
  };

  public getAppraisalScores = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { year, employeeId } = req.query;
    const selectedYear = year || new Date().getFullYear();

    const QUARTERS = ['Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec'];

    try {
      await this.baseService.findById({
        id: Number(employeeId),
        resource: 'Employee',
      });

      const rawResults = await this.appraisalRepo
        .createQueryBuilder('appraisal')
        .select([
          `CASE 
              WHEN EXTRACT(MONTH FROM appraisal.startDate) BETWEEN 1 AND 3 THEN 'Jan-Mar'
              WHEN EXTRACT(MONTH FROM appraisal.startDate) BETWEEN 4 AND 6 THEN 'Apr-Jun'
              WHEN EXTRACT(MONTH FROM appraisal.startDate) BETWEEN 7 AND 9 THEN 'Jul-Sep'
              ELSE 'Oct-Dec'
            END AS quarter`,
          'AVG(appraisal.averageScore) as avgScore',
        ])
        .innerJoin('appraisal.employee', 'employee')
        .where('employee.id = :employeeId', { employeeId })
        .andWhere('EXTRACT(YEAR FROM appraisal.startDate) = :selectedYear', { selectedYear })
        .groupBy('quarter')
        // .orderBy(`FIELD(quarter, 'Jan-Mar', 'Apr-Jun', 'Jul-Sep', 'Oct-Dec')`)
        .getRawMany();

      const resultsMap = new Map(
        rawResults.map((item) => [item.quarter, parseFloat(item.avgScore)]),
      );

      const result = QUARTERS.map((quarter) => ({
        quarter,
        avgScore: resultsMap.get(quarter) || 0,
      }));

      return await this.baseService.createdResponse(res, result);
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };

  public getEmployeeDemographics = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const currentYear = new Date().getFullYear();

    const employees = await this.employeeRepo.find({
      where: { deletedAt: null },
    });

    const totalEmployees = employees?.length || 0;
    const ageGroups = {
      '15-20': 0,
      '21-29': 0,
      '30-39': 0,
      '40-59': 0,
      '60-75': 0,
      '76-100': 0,
    };

    let serviceYears = {
      lessThan15: 0,
      between16And30: 0,
      between31And45: 0,
      greaterThan46: 0,
      lessThan15Percent: 0,
      between16And30Percent: 0,
      between31And45Percent: 0,
      greaterThan46Percent: 0,
    };

    let male = 0;
    let female = 0;

    employees.forEach((employee) => {
      if (employee.gender === Genders.MALE) male++;
      if (employee.gender === Genders.FEMALE) female++;

      const serviceStartDate = employee.serviceStartDate || employee.createdAt;
      const retiredDate = employee.retiredDate || new Date();

      const years = getDuration(
        serviceStartDate,
        retiredDate,
        DurationUnit.YEAR,
      );

      if (years < 15) serviceYears.lessThan15++;
      if (years > 45) serviceYears.greaterThan46++;
      if (years <= 30 && years > 15) serviceYears.between16And30++;
      if (years <= 45 && years > 30) serviceYears.between31And45++;

      if (employee.dob) {
        const birthYear = new Date(employee.dob).getFullYear();
        const age = currentYear - birthYear;

        if (age >= 15 && age <= 20) ageGroups['15-20']++;
        else if (age >= 21 && age <= 29) ageGroups['21-29']++;
        else if (age >= 30 && age <= 39) ageGroups['30-39']++;
        else if (age >= 40 && age <= 59) ageGroups['40-59']++;
        else if (age >= 60 && age <= 75) ageGroups['60-75']++;
        else if (age >= 76 && age <= 100) ageGroups['76-100']++;
      }
    });

    const locations = await this.getEmployeeCountByStateAndCity();

    const totalServiceYear =
      (serviceYears.lessThan15 +
        serviceYears.greaterThan46 +
        serviceYears.between16And30 +
        serviceYears.between31And45 || 1) / 100;

    serviceYears = {
      ...serviceYears,
      lessThan15Percent: serviceYears.lessThan15 / totalServiceYear,
      greaterThan46Percent: serviceYears.greaterThan46 / totalServiceYear,
      between16And30Percent: serviceYears.between16And30 / totalServiceYear,
      between31And45Percent: serviceYears.between31And45 / totalServiceYear,
    };

    const gender = {
      male,
      female,
      malePercent: !male ? 0 : (male * 100) / totalEmployees,
      femalePercent: !female ? 0 : (female * 100) / totalEmployees,
    };

    return await this.baseService.createdResponse(res, {
      gender,
      ageGroups,
      locations,
      serviceYears,
    });
  };

  async getEmployeeCountByStateAndCity() {
    const result = await this.employeeRepo
      .createQueryBuilder('employee')
      .leftJoin('employee.mailingAddress', 'mailingAddress')
      .select('mailingAddress.state', 'state')
      .addSelect('mailingAddress.city', 'city')
      .addSelect('COUNT(employee.id)', 'count')
      .groupBy('mailingAddress.state')
      .addGroupBy('mailingAddress.city')
      .getRawMany();

    return result;
  }
}
