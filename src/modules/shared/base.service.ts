import { FindOptionsWhere, In, Not, Repository } from 'typeorm';
import { StatusCodes } from 'http-status-codes';
import { CustomError } from '../../middlewares';
import { MESSAGES } from '../../utils';
import { Response } from 'express';

export class BaseService<T> {
  constructor(private repository: Repository<T>) { }

  async findByProperty({
    property,
    value,
    relations = [],
    resource,
    canBeNull,
  }: {
    property: string;
    value: any;
    relations?: string[];
    resource?: string;
    canBeNull?: boolean;
  }): Promise<T | null> {
    if (!value && canBeNull) return null;

    const entity = await this.repository.findOne({
      where: { [property]: value } as any,
      relations,
    });
    if (!entity) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND(resource || 'Resource'),
        StatusCodes.NOT_FOUND,
      );
    }
    return entity;
  }

  async findById({
    id,
    relations = [],
    resource,
    canBeNull,
  }: {
    id: number;
    relations?: string[];
    resource?: string;
    canBeNull?: boolean;
  }): Promise<T> {
    if (!id && canBeNull) return null;

    return this.findByProperty({
      property: 'id',
      value: id,
      relations,
      resource,
    });
  }

  async findAll({
    relations = [],
    where,
    res,
  }: {
    relations?: string[];
    res?: Response;
    where?: FindOptionsWhere<T>;
  }): Promise<T[] | Response> {
    const data = await this.repository.find({ where, relations });

    if (res) {
      return this.successResponse(res, data);
    }

    return data;
  }

  async findAllWithPagination({
    relations = [],
    where,
    res,
    page = 1,
    limit = 10,
  }: {
    relations?: string[];
    res?: Response;
    where?: FindOptionsWhere<T>;
    page?: number;
    limit?: number;
  }): Promise<{ data: T[]; pagination: { page: number; limit: number; total: number; totalPages: number } } | Response> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where,
      relations,
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);
    const pagination = {
      page,
      limit,
      total,
      totalPages,
    };

    if (res) {
      return this.successResponse(res, { data, pagination });
    }

    return { data, pagination };
  }

  async findByIds({
    ids,
    relations = [],
    resource,
    validate = true,
  }: {
    ids: number[];
    relations?: string[];
    resource?: string;
    validate?: boolean;
  }): Promise<T[]> {
    if (!ids?.length && validate) {
      throw new CustomError(
        `${resource || 'Resource'} ids are required`,
        StatusCodes.NOT_FOUND,
      );
    }

    const entity = await this.repository.find({
      where: { id: In(ids) } as any,
      relations,
    });

    if (validate && entity.length < ids?.length) {
      throw new CustomError(
        `Some ${resource || 'resource'} not found`,
        StatusCodes.NOT_FOUND,
      );
    }

    return entity;
  }

  async create(data: Partial<T>, res?: Response): Promise<T | Response> {
    const entity = this.repository.create(data as T);

    const savedData = await this.repository.save(entity);

    if (res) {
      return res.status(StatusCodes.CREATED).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data: savedData,
      });
    }
    return savedData;
  }

  async updateById({
    id,
    data,
    res,
  }: {
    id: number;
    data: Partial<T>;
    res?: Response;
  }): Promise<T | Response> {
    const entity = await this.findById({ id });
    Object.assign(entity, data);
    const savedData = this.repository.save(entity);

    if (res) {
      return res.status(StatusCodes.OK).json({
        status: 'success',
        message: MESSAGES.OPS_SUCCESSFUL,
        data: savedData,
      });
    }
    return savedData;
  }

  async delete({
    id,
    resource,
    res,
  }: {
    id: number;
    resource?: string;
    res?: Response;
  }): Promise<void> {
    const entity = await this.findById({ id, resource });
    await this.repository.remove(entity);
    if (res) {
      this.successResponse(res);
    }
  }

  async isPropertyTaken(
    property: string,
    value: any,
    errorName?: string,
    excludeId?: number,
  ): Promise<boolean> {
    const whereClause: any = { [property]: value };

    if (excludeId) {
      whereClause.id = Not(excludeId);
    }

    const existing = await this.repository.findOne({ where: whereClause });

    // const existing = await this.repository.findOne({
    //   where: { [property]: value } as any,
    // });

    if (existing) {
      throw new CustomError(
        MESSAGES.DUPLICATE(errorName || property),
        StatusCodes.BAD_REQUEST,
      );
    }
    return !!existing;
  }

  async isPropertiesTaken(properties: Record<string, any>): Promise<void> {
    const whereClause = Object.entries(properties).map(([key, value]) => ({
      [key]: value,
    }));

    const existing = await this.repository.findOne({
      where: whereClause as any,
    });

    if (existing) {
      const errors: Record<string, string> = {};

      for (const key of Object.keys(properties)) {
        if (existing[key] === properties[key]) {
          errors[key] = MESSAGES.DUPLICATE(key);
        }
      }

      if (Object.keys(errors).length > 0) {
        throw new CustomError(
          Object.keys(errors).join(' and '),
          StatusCodes.BAD_REQUEST,
        );
      }
    }
  }

  async validateMultipleIds(
    ids: number[],
    relations = [],
    errorName?: string,
  ): Promise<T[]> {
    const entities = await this.repository.find({
      where: { id: In(ids) } as any,
      relations,
    });
    if (entities.length !== ids.length) {
      throw new CustomError(
        MESSAGES.RESOURCE_NOT_FOUND(errorName || 'Some resource'),
        StatusCodes.NOT_FOUND,
      );
    }
    return entities as T[];
  }

  async createdResponse(res: Response, data: any) {
    return res.status(StatusCodes.CREATED).json({
      status: 'success',
      message: MESSAGES.OPS_SUCCESSFUL,
      data,
    });
  }

  async updatedResponse(res: Response, data: any) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: MESSAGES.OPS_SUCCESSFUL,
      data,
    });
  }

  async successResponse(res: Response, data?: any) {
    return res.status(StatusCodes.OK).json({
      status: 'success',
      message: MESSAGES.OPS_SUCCESSFUL,
      ...(data && { data }),
    });
  }

  async catchErrorResponse(res: Response, error: any) {
    return res
      .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }

  async errorResponse(res: Response, error: any) {
    return res
      .status(error.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: error.message });
  }

  async notFoundResponse(res: Response, resource: string) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ error: MESSAGES.RESOURCE_NOT_FOUND(resource || 'Resource') });
  }
}
