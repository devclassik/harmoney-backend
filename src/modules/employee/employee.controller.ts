import {
  AppDataSource,
  ChurchPosition,
  Contact,
  Department,
  Employee,
  EmployeeCredential,
  FamilyMember,
  Organization,
  Role,
  User,
  UserRoles,
} from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import { generateRandomString } from '../../utils';
import { UpdateEmployeeDto } from './employee.dto';
import { hashPassword } from '@/middlewares';
import * as XLSX from 'xlsx';
import { StatusCodes } from 'http-status-codes';
import { Like } from 'typeorm';

export class EmployeeController {
  private orgRepo = AppDataSource.getRepository(Organization);
  private employeeRepo = AppDataSource.getRepository(Employee);
  private contactRepo = AppDataSource.getRepository(Contact);
  private churPosRepo = AppDataSource.getRepository(ChurchPosition);
  private familyMemRepo = AppDataSource.getRepository(FamilyMember);
  private credRepo = AppDataSource.getRepository(EmployeeCredential);
  private userRepo = AppDataSource.getRepository(User);
  private roleRepo = AppDataSource.getRepository(Role);
  private baseService = new BaseService(AppDataSource.getRepository(Employee));
  private roleBaseService = new BaseService(AppDataSource.getRepository(Role));
  private userBaseService = new BaseService(AppDataSource.getRepository(User));
  private deptBaseService = new BaseService(
    AppDataSource.getRepository(Department),
  );

  public create = async (req: Request, res: Response): Promise<Response> => {
    const {
      employeeId,
      firstName,
      lastName,
      email,
      role: roleType,
      departmentId,
      location: address,
    } = req.body;

    try {
      await this.userBaseService.isPropertyTaken(
        'email',
        email,
        'Email address',
      );
      await this.baseService.isPropertyTaken(
        'employeeId',
        employeeId,
        'Employee ID',
      );
      const department = await this.deptBaseService.findById({
        id: departmentId,
        resource: 'Department',
      });
      const role = await this.roleRepo.findOne({ where: { name: roleType } });
      const password = await generateRandomString(8);
      const pwdHash = await hashPassword(password);
      let user = this.userRepo.create({
        email,
        role,
        password: pwdHash,
      });
      const employee = this.employeeRepo.create({
        firstName,
        lastName,
        employeeId,
        departments: [department],
      });

      const contact = this.contactRepo.create({
        address,
      });

      await this.userRepo.manager.transaction(async (manager) => {
        await manager.save(contact);

        employee.mailingAddress = contact;
        await manager.save(employee);

        if (roleType === UserRoles.HOD) {
          department.hod = employee;
          await manager.save(department);
        }
        user.employee = employee;
        await manager.save(user);
      });

      return await this.baseService.createdResponse(res, employee);
    } catch (error) {
      this.baseService.catchErrorResponse(res, error);
    }
  };

  public update = async (
    req: Request<UpdateEmployeeDto, null, UpdateEmployeeDto, null> & {
      user: User;
    },
    res: Response,
  ): Promise<Response> => {
    const { employeeId: id } = req.params;
    const employeeId = Number(id);
    const updateData = req.body;
    const user = req.user;
    const {
      email,
      primaryPhone,
      altEmail,
      altPhone,
      role: roleName,
      departmentId,
      homeAddress,
      homeCity,
      homeState,
      homeCountry,
      homeZipCode,
      mailingAddress,
      mailingCity,
      mailingState,
      mailingCountry,
      mailingZipCode,
      yearSaved,
      sanctified,
      baptizedWithWater,
      yearOfWaterBaptism,
      firstYearInChurch,
      isFaithfulInTithing,
      firstSermonPastor,
      currentPastor,
      dateOfFirstSermon,
      spiritualStatus,
      firstSermonAddress,
      firstSermonCity,
      firstSermonState,
      firstSermonCountry,
      firstSermonZipCode,
      currentChurchAddress,
      currentChurchCity,
      currentChurchState,
      currentChurchCountry,
      currentChurchZipCode,
      spouseFirstName,
      spouseMiddleName,
      spouseDob,
      weddingDate,
      children,
      previousChurchPositions,
      credentialName,
      credentialNumber,
      credentialIssuedDate,
      credentialExpirationDate,
    } = updateData;

    try {
      // Check if employee exists
      const employee = await this.baseService.findById({
        id: Number(id),
        relations: [
          'homeAddress',
          'mailingAddress',
          'credentials',
          'children',
          'spouse',
          'previousPositions',
          'spiritualHistory',
          'spiritualHistory.locationOfFirstSermon',
          'spiritualHistory.currentChurchLocation',
        ],
      });

      /* TODO: Uncomment if email is editable */
      // await this.userBaseService.isPropertiesTaken({
      //   ['email']: email,
      // });

      await this.baseService.isPropertiesTaken({
        ['primaryPhone']: primaryPhone,
        ['altEmail']: altEmail,
        ['altPhone']: altPhone,
      });

      // Fetch related entities
      const role = await this.roleBaseService.findByProperty({
        property: 'name',
        value: roleName,
        canBeNull: true,
        resource: 'Role',
      });

      const department = await this.deptBaseService.findById({
        id: departmentId,
        canBeNull: true,
        resource: 'Department',
      });

      // Delete saved previous church positions
      if (previousChurchPositions?.length) {
        const churPos = await this.churPosRepo.find({
          where: { employee: { id: employeeId } },
        });
        await this.churPosRepo.remove(churPos);
      }

      if (children?.length) {
        const familyMember = await this.familyMemRepo.find({
          where: { employee: { id: employeeId } },
        });
        await this.familyMemRepo.remove(familyMember);
      }

      if (credentialName || credentialNumber) {
        const credentials = await this.credRepo.find({
          where: { employee: { id: employeeId } },
        });
        await this.credRepo.remove(credentials);
      }

      // Update employee
      const homeContact = employee.homeAddress;
      const mailingContact = employee.mailingAddress;

      Object.assign(employee, updateData);

      user.role = role;
      if (department) employee.departments = [department];

      if (homeAddress || homeCity || homeState || homeCountry || homeZipCode) {
        employee.homeAddress = {
          ...homeContact,
          address: homeAddress,
          city: homeCity,
          state: homeState,
          country: homeCountry,
          zipCode: homeZipCode,
        };
      }
      if (
        mailingAddress ||
        mailingCity ||
        mailingState ||
        mailingCountry ||
        mailingZipCode
      ) {
        employee.mailingAddress = {
          ...mailingContact,
          address: mailingAddress,
          city: mailingCity,
          state: mailingState,
          country: mailingCountry,
          zipCode: mailingZipCode,
        };
      }
      if (spouseFirstName || spouseMiddleName || spouseDob || weddingDate) {
        employee.spouse = {
          ...employee.spouse,
          firstName: spouseFirstName,
          middleName: spouseMiddleName,
          dob: spouseDob,
          weddingDate,
        };
      }
      if (previousChurchPositions?.length) {
        employee.previousPositions = previousChurchPositions?.map(
          (position) => ({
            title: position,
          }),
        );
      }
      if (children?.length) {
        employee.children = children?.map((child) => ({
          name: child.childName,
          dob: child.childDob,
          gender: child.childGender,
        }));
      }
      if (
        credentialName ||
        credentialNumber ||
        credentialIssuedDate ||
        credentialExpirationDate
      ) {
        employee.credentials = [
          {
            name: credentialName,
            number: credentialNumber,
            issuedDate: credentialIssuedDate,
            expirationDate: credentialExpirationDate,
          },
        ];
      }
      employee.spiritualHistory = {
        ...employee.spiritualHistory,
        yearSaved,
        sanctified,
        baptizedWithWater,
        yearOfWaterBaptism,
        firstYearInChurch,
        isFaithfulInTithing,
        firstSermonPastor,
        currentPastor,
        dateOfFirstSermon,
        spiritualStatus,
        ...(firstSermonAddress ||
          firstSermonCity ||
          firstSermonState ||
          firstSermonCountry ||
          firstSermonZipCode
          ? {
            locationOfFirstSermon: {
              ...employee?.spiritualHistory?.locationOfFirstSermon,
              address: firstSermonAddress,
              city: firstSermonCity,
              state: firstSermonState,
              country: firstSermonCountry,
              zipCode: firstSermonZipCode,
            },
          }
          : {}),
        ...(currentChurchAddress ||
          currentChurchCity ||
          currentChurchState ||
          currentChurchCountry ||
          currentChurchZipCode
          ? {
            currentChurchLocation: {
              ...employee?.spiritualHistory?.currentChurchLocation,
              address: currentChurchAddress,
              city: currentChurchCity,
              state: currentChurchState,
              country: currentChurchCountry,
              zipCode: currentChurchZipCode,
            },
          }
          : {}),
      };

      await this.employeeRepo.save(employee);

      return res.status(StatusCodes.OK).json(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error due to property is in use by another person', ActualError: error });
    }
  };

  public get = async (req: Request, res: Response): Promise<Response> => {
    const employeeId = Number(req.params.employeeId);

    try {
      const employee = await this.baseService.findById({
        id: employeeId,
        resource: 'Employee',
        relations: [
          'user',
          'user.role',
          'user.role.permissions',
          'spouse',
          'children',
          'payrolls',
          'documents',
          'credentials',
          'departments',
          'homeAddress',
          'mailingAddress',
          'departmentHeads',
          'previousPositions',
          'spiritualHistory',
          'spiritualHistory.locationOfFirstSermon',
          'spiritualHistory.currentChurchLocation',
        ],
      });

      return this.baseService.updatedResponse(res, employee);
    } catch (error) {
      return this.baseService.errorResponse(res, error);
    }
  };

  public getAll = async (req: Request, res: Response): Promise<Response> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      await this.baseService.findAllWithPagination({
        res,
        relations: ['user', 'mailingAddress', 'user.role', 'departments'],
        page,
        limit,
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
    }
  };

  public getEmployeeByName = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const { name } = req.params;

      const employees = await this.employeeRepo.find({
        relations: ['user', 'mailingAddress', 'user.role', 'departments'],
        where: [
          { firstName: Like(`%${name}%`) },
          { lastName: Like(`%${name}%`) },
          { middleName: Like(`%${name}%`) },
        ],
      });

      return await this.baseService.successResponse(res, employees);
    } catch (error) {
      return this.baseService.catchErrorResponse(res, error);
    }
  };

  public delete = async (
    req: Request,
    res: Response,
  ): Promise<Response | void> => {
    const employeeId = Number(req.params.employeeId);

    try {
      await this.baseService.delete({
        id: employeeId,
        resource: 'employee',
      });
    } catch (error) {
      this.baseService.errorResponse(res, error);
    }
  };


  /**
   * Bulk upload employees from Excel file
   * Expected Excel columns: employeeId, firstName, lastName, email, departmentId, role, location, employmentType
   * 
   * Excel Structure:
   * | employeeId | firstName | lastName | email | departmentId | role | location | employmentType |
   * |------------|-----------|----------|-------|--------------|------|----------|----------------|
   * | EMP001     | John      | Doe      | john@example.com | 1 | STAFF | New York | STAFF |
   * | EMP002     | Jane      | Smith    | jane@example.com | 2 | HOD | Los Angeles | STAFF |
   * 
   * Required fields: employeeId, firstName, lastName, email, departmentId, role, location, employmentType
   * Valid roles: STAFF, VOLUNTEER, HOD, etc. (must exist in the roles table)
   * Valid employment types: STAFF, VOLUNTEER
   */
  public bulkUploadEmployees = async (req: Request, res: Response): Promise<Response> => {
    try {
      const file = req.file;

      if (!file) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'No Excel file uploaded',
        });
      }

      // Check if it's an Excel file
      const allowedTypes = [
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'Please upload a valid Excel file (.xls or .xlsx)',
        });
      }

      // Parse Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (!data || data.length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: 'error',
          message: 'Excel file is empty or has no data',
        });
      }

      const results = {
        success: [],
        errors: [],
        total: data.length,
      };

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        const rowNumber = i + 2; // Excel rows start from 1, but we have header row

        try {
          // Validate required fields
          const requiredFields = ['employeeId', 'firstName', 'lastName', 'email', 'departmentId', 'role', 'location', 'employmentType'];
          const missingFields = requiredFields.filter(field => !row[field]);

          if (missingFields.length > 0) {
            results.errors.push({
              row: rowNumber,
              employeeId: row.employeeId || 'N/A',
              firstName: row.firstName || 'N/A',
              lastName: row.lastName || 'N/A',
              email: row.email || 'N/A',
              departmentId: row.departmentId || 'N/A',
              role: row.role || 'N/A',
              location: row.location || 'N/A',
              employmentType: row.employmentType || 'N/A',
              error: `Missing required fields: ${missingFields.join(', ')}`,
              status: 'FAILED',
            });
            continue;
          }

          // Check if employee already exists
          const existingEmployee = await this.employeeRepo.findOne({
            where: { employeeId: row.employeeId },
          });

          if (existingEmployee) {
            results.errors.push({
              row: rowNumber,
              employeeId: row.employeeId,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              departmentId: row.departmentId,
              role: row.role,
              location: row.location,
              employmentType: row.employmentType,
              error: `Employee with ID ${row.employeeId} already exists`,
              status: 'FAILED',
            });
            continue;
          }

          // Check if email already exists
          const existingUser = await this.userRepo.findOne({
            where: { email: row.email },
          });

          if (existingUser) {
            results.errors.push({
              row: rowNumber,
              employeeId: row.employeeId,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              departmentId: row.departmentId,
              role: row.role,
              location: row.location,
              employmentType: row.employmentType,
              error: `Email ${row.email} already exists`,
              status: 'FAILED',
            });
            continue;
          }

          // Get department
          const department = await this.deptBaseService.findById({
            id: Number(row.departmentId),
            resource: 'Department',
          });

          // Get role
          const role = await this.roleRepo.findOne({ where: { name: row.role } });
          if (!role) {
            results.errors.push({
              row: rowNumber,
              employeeId: row.employeeId,
              firstName: row.firstName,
              lastName: row.lastName,
              email: row.email,
              departmentId: row.departmentId,
              role: row.role,
              location: row.location,
              employmentType: row.employmentType,
              error: `Role ${row.role} not found`,
              status: 'FAILED',
            });
            continue;
          }

          // Generate password
          const password = await generateRandomString(8);
          const pwdHash = await hashPassword(password);

          // Create user
          const user = this.userRepo.create({
            email: row.email,
            role,
            password: pwdHash,
          });

          // Create employee
          const employee = this.employeeRepo.create({
            firstName: row.firstName,
            lastName: row.lastName,
            employeeId: row.employeeId,
            departments: [department],
          });

          // Create contact
          const contact = this.contactRepo.create({
            address: row.location,
          });

          // Save everything in a transaction
          await this.userRepo.manager.transaction(async (manager) => {
            await manager.save(contact);
            employee.mailingAddress = contact;
            await manager.save(employee);

            if (row.role === UserRoles.HOD) {
              department.hod = employee;
              await manager.save(department);
            }
            user.employee = employee;
            await manager.save(user);
          });

          results.success.push({
            row: rowNumber,
            employeeId: row.employeeId,
            email: row.email,
            password, // Return the generated password
          });

        } catch (error) {
          results.errors.push({
            row: rowNumber,
            employeeId: row.employeeId || 'N/A',
            firstName: row.firstName || 'N/A',
            lastName: row.lastName || 'N/A',
            email: row.email || 'N/A',
            departmentId: row.departmentId || 'N/A',
            role: row.role || 'N/A',
            location: row.location || 'N/A',
            employmentType: row.employmentType || 'N/A',
            error: error.message || 'Unknown error occurred',
            status: 'FAILED',
          });
        }
      }

      // If there are errors, generate and return error report
      if (results.errors.length > 0) {
        // Create error report with summary
        const errorReport = {
          summary: {
            totalRows: results.total,
            successful: results.success.length,
            failed: results.errors.length,
            timestamp: new Date().toISOString(),
          },
          errors: results.errors,
        };

        // Create Excel workbook with error details
        const errorWorkbook = XLSX.utils.book_new();

        // Summary sheet
        const summaryData = [
          { metric: 'Total Rows Processed', value: results.total },
          { metric: 'Successfully Created', value: results.success.length },
          { metric: 'Failed Rows', value: results.errors.length },
          { metric: 'Success Rate', value: `${((results.success.length / results.total) * 100).toFixed(2)}%` },
          { metric: 'Timestamp', value: new Date().toISOString() },
        ];
        const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(errorWorkbook, summaryWorksheet, 'Summary');

        // Errors sheet
        const errorWorksheet = XLSX.utils.json_to_sheet(results.errors);
        XLSX.utils.book_append_sheet(errorWorkbook, errorWorksheet, 'Errors');

        // Successful employees sheet (if any)
        if (results.success.length > 0) {
          const successWorksheet = XLSX.utils.json_to_sheet(results.success);
          XLSX.utils.book_append_sheet(errorWorkbook, successWorksheet, 'Successful');
        }

        const errorBuffer = XLSX.write(errorWorkbook, { type: 'buffer' });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=bulk_upload_report_${new Date().toISOString().split('T')[0]}.xlsx`);
        return res.status(StatusCodes.OK).send(errorBuffer);
      }

      // If all employees were created successfully, return success response with option to download report
      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: `Bulk upload completed successfully! All ${results.success.length} employees were created.`,
        data: {
          total: results.total,
          successful: results.success.length,
          failed: results.errors.length,
          successRate: '100%',
          successfulEmployees: results.success,
          downloadUrl: `/api/v1/employee/bulk-upload/success-report?timestamp=${new Date().toISOString()}`,
        },
      });

    } catch (error) {
      console.error('Bulk upload error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message || 'Failed to process Excel file',
      });
    }
  };

  /**
   * Download success report for bulk upload
   */
  public downloadSuccessReport = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { timestamp } = req.query;

      // This would typically fetch the success data from a temporary storage or session
      // For now, we'll create a sample success report
      const successData = [
        {
          row: 2,
          employeeId: 'EMP001',
          email: 'john@example.com',
          password: 'aB3x9K2m',
          status: 'SUCCESS',
        },
        {
          row: 3,
          employeeId: 'EMP002',
          email: 'jane@example.com',
          password: 'xY7zQ4nP',
          status: 'SUCCESS',
        },
      ];

      // Create Excel workbook with success details
      const successWorkbook = XLSX.utils.book_new();

      // Summary sheet
      const summaryData = [
        { metric: 'Total Employees Created', value: successData.length },
        { metric: 'Success Rate', value: '100%' },
        { metric: 'Timestamp', value: timestamp || new Date().toISOString() },
        { metric: 'Status', value: 'COMPLETED' },
      ];
      const summaryWorksheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(successWorkbook, summaryWorksheet, 'Summary');

      // Success details sheet
      const successWorksheet = XLSX.utils.json_to_sheet(successData);
      XLSX.utils.book_append_sheet(successWorkbook, successWorksheet, 'Successful Employees');

      const successBuffer = XLSX.write(successWorkbook, { type: 'buffer' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=bulk_upload_success_report_${new Date().toISOString().split('T')[0]}.xlsx`);
      return res.status(StatusCodes.OK).send(successBuffer);

    } catch (error) {
      console.error('Download success report error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: error.message || 'Failed to generate success report',
      });
    }
  };
}
