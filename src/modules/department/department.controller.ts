import {
  AppDataSource,
  Department,
  Employee,
  Organization,
  User,
} from '../../database';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../../middlewares';
import { In } from 'typeorm';
import { MESSAGES } from '../../utils';

export class DepartmentController {
  private departmentRepo = AppDataSource.getRepository(Department);
  private orgRepo = AppDataSource.getRepository(Organization);
  private employeeRepo = AppDataSource.getRepository(Employee);

  /**
   * Create a new department
   */
  public createDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { name, hod, members, organizationId } = req.body;

    try {
      // Check if department name already exists
      const existingDepartment = await this.departmentRepo.findOne({
        where: { name },
      });
      if (existingDepartment) {
        throw new CustomError(
          MESSAGES.DUPLICATE('Department name'),
          StatusCodes.BAD_REQUEST,
        );
      }

      const organization = await this.orgRepo.findOne({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Organization'),
          StatusCodes.BAD_REQUEST,
        );
      }

      // Validate HOD if provided
      let hodEmployee: Employee | null = null;
      if (hod) {
        hodEmployee = await this.employeeRepo.findOne({ where: { id: hod } });
        if (!hodEmployee) {
          throw new CustomError(
            MESSAGES.RESOURCE_NOT_FOUND('HOD Employee'),
            StatusCodes.NOT_FOUND,
          );
        }
      }

      // Validate members if provided
      let deptMembers: Employee[] = [];
      if (members && members.length > 0) {
        deptMembers = await this.employeeRepo.findByIds(members);
        if (deptMembers.length !== members.length) {
          throw new CustomError(
            MESSAGES.RESOURCE_NOT_FOUND('Some employees in members'),
            StatusCodes.NOT_FOUND,
          );
        }
      }

      // Create and save department
      const department = this.departmentRepo.create({
        name,
        hod: hodEmployee || null,
        members: deptMembers,
        organization: { id: organizationId },
      });
      await this.departmentRepo.save(department);

      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data: department,
      });
    } catch (error) {
      return res
        .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  /**
   * Update a department
   */
  public updateDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { departmentId } = req.params;
    const { name, hod, members, membersToAdd, membersToRemove } = req.body;

    // Check if department name already exists
    // const existingDepartment = await this.departmentRepo.findOne({
    //   where: { name },
    // });

    // if (existingDepartment) {
    //   throw new CustomError(
    //     MESSAGES.DUPLICATE('Department name'),
    //     StatusCodes.BAD_REQUEST,
    //   );
    // }

    try {
      const department = await this.departmentRepo.findOne({
        where: { id: Number(departmentId) },
        relations: ['members'],
      });

      if (!department) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Department'),
          StatusCodes.NOT_FOUND,
        );
      }

      // Update department name if provided
      if (name) {
        department.name = name;
      }

      // Update HOD if provided
      if (hod) {
        const hodEmployee = await this.employeeRepo.findOne({
          where: { id: hod },
        });
        if (!hodEmployee) {
          throw new CustomError(
            MESSAGES.RESOURCE_NOT_FOUND('HOD Employee'),
            StatusCodes.NOT_FOUND,
          );
        }
        department.hod = hodEmployee;
      }

      // Handle member updates
      if (members) {
        department.members = await this.employeeRepo.find({
          where: { id: In(members) },
        });
      } else {
        if (membersToAdd && membersToAdd.length > 0) {
          const newMembers = await this.employeeRepo.find({
            where: { id: In(membersToAdd) },
          });
          department.members = [...department.members, ...newMembers];
        }
        if (membersToRemove && membersToRemove.length > 0) {
          department.members = department.members.filter(
            (member) => !membersToRemove.includes(member.id),
          );
        }
      }

      await this.departmentRepo.save(department);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data: department,
      });
    } catch (error) {
      return res
        .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  /**
   * Get a department by ID
   */
  public getDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { departmentId } = req.params;

    try {
      const department = await this.departmentRepo.findOne({
        where: { id: Number(departmentId) },
        relations: ['hod', 'members'],
      });

      if (!department) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Department'),
          StatusCodes.NOT_FOUND,
        );
      }

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: department,
      });
    } catch (error) {
      return res
        .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  /**
   * Get a department by ID
   */
  public getAllDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const departments = await this.departmentRepo.find({
        relations: ['hod', 'members'],
      });

      return res.status(StatusCodes.OK).json({
        status: 'success',
        data: departments,
      });
    } catch (error) {
      return res
        .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };

  /**
   * Delete a department
   */
  public deleteDepartment = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    const { departmentId } = req.params;

    try {
      const department = await this.departmentRepo.findOne({
        where: { id: Number(departmentId) },
      });

      if (!department) {
        throw new CustomError(
          MESSAGES.RESOURCE_NOT_FOUND('Department'),
          StatusCodes.NOT_FOUND,
        );
      }

      await this.departmentRepo.remove(department);

      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
      });
    } catch (error) {
      return res
        .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  };
}
