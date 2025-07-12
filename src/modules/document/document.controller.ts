import { AppDataSource, Document } from '../../database';
import { Request, Response } from 'express';
import { BaseService } from '../shared/base.service';
import { StatusCodes } from 'http-status-codes';
import { CreateDocumentDto, UpdateDocumentDto } from './document.dto';

export class DocumentController {
    private documentRepo = AppDataSource.getRepository(Document);
    private baseService = new BaseService(AppDataSource.getRepository(Document));

    public create = async (req: Request, res: Response): Promise<Response> => {
        const { documentId, name, downloadUrl, type } = req.body;

        try {
            if (documentId) {
                await this.baseService.isPropertyTaken(
                    'documentId',
                    documentId,
                    'Document ID',
                );
            }

            const document = this.documentRepo.create({
                documentId,
                name,
                downloadUrl,
                type,
            });

            await this.documentRepo.save(document);

            return await this.baseService.createdResponse(res, document);
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };

    public update = async (
        req: Request<{ id: string }, null, UpdateDocumentDto, null>,
        res: Response,
    ): Promise<Response> => {
        const { id } = req.params;
        const updateData = req.body;

        try {
            const document = await this.baseService.findById({
                id: Number(id),
                resource: 'Document',
            });

            if (updateData.documentId && updateData.documentId !== document.documentId) {
                await this.baseService.isPropertyTaken(
                    'documentId',
                    updateData.documentId,
                    'Document ID',
                );
            }

            Object.assign(document, updateData);
            await this.documentRepo.save(document);

            return await this.baseService.successResponse(res, document);
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };

    public get = async (
        req: Request<{ id: string }>,
        res: Response,
    ): Promise<Response> => {
        const { id } = req.params;

        try {
            const document = await this.baseService.findById({
                id: Number(id),
                resource: 'Document',
            });

            return await this.baseService.successResponse(res, document);
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };

    public getAll = async (req: Request, res: Response): Promise<Response> => {
        const { page = 1, limit = 10, type, name } = req.query;

        try {
            const queryBuilder = this.documentRepo.createQueryBuilder('document');

            if (type) {
                queryBuilder.andWhere('document.type = :type', { type });
            }

            if (name) {
                queryBuilder.andWhere('document.name ILIKE :name', { name: `%${name}%` });
            }

            const [documents, total] = await queryBuilder
                .skip((Number(page) - 1) * Number(limit))
                .take(Number(limit))
                .orderBy('document.createdAt', 'DESC')
                .getManyAndCount();

            return await this.baseService.successResponse(res, {
                documents,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    total,
                    totalPages: Math.ceil(total / Number(limit)),
                },
            });
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };

    public delete = async (
        req: Request<{ id: string }>,
        res: Response,
    ): Promise<Response> => {
        const { id } = req.params;

        try {
            const document = await this.baseService.findById({
                id: Number(id),
                resource: 'Document',
            });

            await this.documentRepo.softDelete(document.id);

            return await this.baseService.successResponse(
                res,
                { message: 'Document deleted successfully' },
            );
        } catch (error) {
            return this.baseService.catchErrorResponse(res, error);
        }
    };
} 