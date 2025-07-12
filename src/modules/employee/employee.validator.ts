import Joi from 'joi';

import { UserRoles } from '../../database';
import { CreateEmployeeDto } from './employee.dto';
import {
  Genders,
  PhoneTypes,
  EmployeeStatus,
  EmploymentTypes,
  TitleTypes,
  SpiritualStatus,
} from '../../database/enum';

export const createEmployeeSchema = Joi.object<CreateEmployeeDto>({
  employeeId: Joi.string().required().messages({
    'string.empty': 'Employee ID is required',
  }),
  firstName: Joi.string().required().messages({
    'string.empty': 'First name is required',
  }),
  lastName: Joi.string().required().messages({
    'string.empty': 'Last name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.empty': 'Email is required',
    'string.email': 'Invalid email format',
  }),
  departmentId: Joi.number().integer().positive().required().messages({
    'number.base': 'Department ID must be a number',
    'number.positive': 'Department ID must be a positive integer',
  }),
  role: Joi.string()
    .valid(...Object.values(UserRoles))
    .required()
    .messages({
      'any.only': 'Invalid role',
      'any.required': 'Role is required',
    }),
  employmentType: Joi.string()
    .valid(...Object.values(EmploymentTypes))
    .required()
    .messages({
      'any.only': 'Invalid employment type',
      'any.required': 'Employment type is required',
    }),
  location: Joi.string().required().messages({
    'string.empty': 'Location is required',
  }),
});

export const updateEmployeeSchema = createEmployeeSchema
  .fork(Object.keys(createEmployeeSchema.describe().keys), (schema) =>
    schema.optional(),
  )
  .append({
    employmentType: Joi.string()
      .valid(...Object.values(EmploymentTypes))
      .optional(),
    title: Joi.string()
      .valid(...Object.values(TitleTypes))
      .optional(),
    middleName: Joi.string().optional(),
    gender: Joi.string()
      .valid(...Object.values(Genders))
      .optional(),
    profferedName: Joi.string().optional(),

    primaryPhone: Joi.string().optional(),
    primaryPhoneType: Joi.string()
      .valid(...Object.values(PhoneTypes))
      .optional(),
    altPhone: Joi.string().optional(),
    altPhoneType: Joi.string()
      .valid(...Object.values(PhoneTypes))
      .optional(),
    dob: Joi.string().optional(),
    photoUrl: Joi.string().uri().optional(),
    altEmail: Joi.string().email().optional(),

    maritalStatus: Joi.string().optional(),
    everDivorced: Joi.boolean().optional(),

    employeeStatus: Joi.string()
      .valid(...Object.values(EmployeeStatus))
      .optional(),

    beenConvicted: Joi.boolean().optional(),
    hasQuestionableBackground: Joi.boolean().optional(),
    hasBeenInvestigatedForMisconductOrAbuse: Joi.boolean().optional(),

    previousChurchPositions: Joi.array().items(Joi.string()).optional(),

    // Home Contact
    homeAddress: Joi.string().optional(),
    homeCity: Joi.string().optional(),
    homeState: Joi.string().optional(),
    homeCountry: Joi.string().optional(),
    homeZipCode: Joi.string().optional(),

    // Mailing Contact
    mailingAddress: Joi.string().optional(),
    mailingCity: Joi.string().optional(),
    mailingState: Joi.string().optional(),
    mailingCountry: Joi.string().optional(),
    mailingZipCode: Joi.string().optional(),

    // Spouse Info
    spouseFirstName: Joi.string().optional(),
    spouseMiddleName: Joi.string().optional(),
    spouseDob: Joi.string().optional(),
    weddingDate: Joi.string().optional(),

    // Child Info
    children: Joi.array()
      .items(
        Joi.object({
          childName: Joi.string().optional(),
          childDob: Joi.string().optional(),
          childGender: Joi.string()
            .valid(...Object.values(Genders))
            .optional(),
        }),
      )
      .optional(),

    // Spiritual History
    yearSaved: Joi.string().optional(),
    sanctified: Joi.boolean().optional(),
    baptizedWithWater: Joi.boolean().optional(),
    yearOfWaterBaptism: Joi.string().optional(),
    firstYearInChurch: Joi.string().optional(),
    isFaithfulInTithing: Joi.boolean().optional(),
    firstSermonPastor: Joi.string().optional(),
    currentPastor: Joi.string().optional(),
    dateOfFirstSermon: Joi.string().optional(),
    spiritualStatus: Joi.string()
      .valid(...Object.values(SpiritualStatus))
      .optional(),

    // First Sermon Contact
    firstSermonAddress: Joi.string().optional(),
    firstSermonCity: Joi.string().optional(),
    firstSermonState: Joi.string().optional(),
    firstSermonCountry: Joi.string().optional(),
    firstSermonZipCode: Joi.string().optional(),

    // Current Church Contact
    currentChurchAddress: Joi.string().optional(),
    currentChurchCity: Joi.string().optional(),
    currentChurchState: Joi.string().optional(),
    currentChurchCountry: Joi.string().optional(),
    currentChurchZipCode: Joi.string().optional(),

    // Employee Credential
    credentialName: Joi.string().optional(),
    credentialNumber: Joi.string().optional(),
    credentialIssuedDate: Joi.string().optional(),
    credentialExpirationDate: Joi.string().optional(),
  });

export const getEmployeeSchema = Joi.object({
  employeeId: Joi.number().required(),
});

export const deleteEmployeeSchema = Joi.object({
  employeeId: Joi.number().required(),
});

export const getAllEmployeesSchema = Joi.object({
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
});


export const bulkUploadSchema = Joi.object({
  // This schema is mainly for route validation, file validation is handled in the controller
  // The actual Excel file validation happens in the controller method
});

export const getEmployeeByNameSchema = Joi.object({
  name: Joi.string().min(1).required(),
});
