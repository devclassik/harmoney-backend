import { Request, Response } from 'express';
import { AppDataSource, User, Employee } from '@/database';
import { BaseService } from '../shared/base.service';
import { Like } from 'typeorm';

export class UserController {
    private userRepo = AppDataSource.getRepository(User);
    private employeeRepo = AppDataSource.getRepository(Employee);
    private baseService = new BaseService(this.userRepo);

    public getUserByName = async (
        req: Request,
        res: Response,
    ): Promise<Response> => {
        try {
            const { name } = req.params;

            const users = await this.userRepo.find({
                relations: ['employee', 'role'],
                where: [
                    { employee: { firstName: Like(`%${name}%`) } },
                    { employee: { lastName: Like(`%${name}%`) } },
                    { employee: { middleName: Like(`%${name}%`) } },
                ],
            });

            return await this.baseService.successResponse(res, users);
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };
}
