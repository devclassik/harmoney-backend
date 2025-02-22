import { authGuard } from '@/guards';
import { validateRequest } from '@/middlewares/validateRequest.middleware';
import express from 'express';
import {
  createDisciplineSchema,
  updateDisciplineSchema,
  getDisciplineSchema,
  deleteDisciplineSchema,
} from './discipline.validator';
import { DisciplineController } from './discipline.controller';

export const DisciplineRoutes = express.Router();

const controller = new DisciplineController();

DisciplineRoutes.post(
  '/discipline',
  validateRequest(createDisciplineSchema),
  authGuard,
  controller.create,
);

DisciplineRoutes.put(
  '/discipline/:disciplineId',
  validateRequest(updateDisciplineSchema),
  authGuard,
  controller.update,
);

DisciplineRoutes.get(
  '/discipline/:disciplineId',
  validateRequest(getDisciplineSchema),
  authGuard,
  controller.get,
);

DisciplineRoutes.get('/discipline', authGuard, controller.getAll);

DisciplineRoutes.delete(
  '/discipline/:disciplineId',
  validateRequest(deleteDisciplineSchema),
  authGuard,
  controller.delete,
);

export default DisciplineRoutes;
