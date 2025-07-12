import Joi from 'joi';
import { DocumentTypes } from '../../database/enum';
import { CreateDocumentDto } from './document.dto';

export const createDocumentSchema = Joi.object<CreateDocumentDto>({
    documentId: Joi.string().optional().messages({
        'string.empty': 'Document ID cannot be empty if provided',
    }),
    name: Joi.string().required().messages({
        'string.empty': 'Document name is required',
        'any.required': 'Document name is required',
    }),
    downloadUrl: Joi.string().uri().required().messages({
        'string.empty': 'Download URL is required',
        'string.uri': 'Download URL must be a valid URI',
        'any.required': 'Download URL is required',
    }),
    type: Joi.string()
        .valid(...Object.values(DocumentTypes))
        .optional()
        .messages({
            'any.only': 'Invalid document type',
        }),
});

export const updateDocumentSchema = createDocumentSchema
    .fork(Object.keys(createDocumentSchema.describe().keys), (schema) =>
        schema.optional(),
    );

export const getDocumentSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Document ID must be a number',
        'number.integer': 'Document ID must be an integer',
        'number.positive': 'Document ID must be a positive integer',
        'any.required': 'Document ID is required',
    }),
});

export const deleteDocumentSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'Document ID must be a number',
        'number.integer': 'Document ID must be an integer',
        'number.positive': 'Document ID must be a positive integer',
        'any.required': 'Document ID is required',
    }),
});

export const getAllDocumentsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be an integer',
        'number.min': 'Page must be at least 1',
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be an integer',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 100',
    }),
    type: Joi.string()
        .valid(...Object.values(DocumentTypes))
        .optional()
        .messages({
            'any.only': 'Invalid document type',
        }),
    name: Joi.string().optional().messages({
        'string.empty': 'Name cannot be empty if provided',
    }),
}); 