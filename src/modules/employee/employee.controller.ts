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
import { hashPassword } from '../../middlewares';
import { UpdateEmployeeDto } from './employee.dto';

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

      return res.status(200).json(employee);
    } catch (error) {
      console.error('Error updating employee:', error);
      return res.status(500).json({ error: 'Internal server error' });
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
      await this.baseService.findAll({
        res,
        relations: ['user', 'mailingAddress'],
      });
    } catch (error) {
      return await this.baseService.errorResponse(res, error);
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
}
