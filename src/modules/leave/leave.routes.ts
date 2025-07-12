import express from 'express';
import { validateRequest } from '../../middlewares/validateRequest.middleware';
import { authGuard } from '../../guards';
import {
  createAnnualLeaveSchema,
  updateAnnualLeaveSchema,
  createAbsenceLeaveSchema,
  updateAbsenceLeaveSchema,
  createSickLeaveSchema,
  updateSickLeaveSchema,
  getLeaveSchema,
  deleteLeaveSchema,
  getLeavesByEmployeeSchema,
} from './leave.validator';
import { LeaveController } from './leave.controller';

export const LeaveRoutes = express.Router();

const leaveCtrl = new LeaveController();

// Annual Leave Routes
LeaveRoutes.post(
  '/leave/annual',
  validateRequest(createAnnualLeaveSchema),
  authGuard,
  leaveCtrl.createAnnualLeave,
);

LeaveRoutes.put(
  '/leave/annual/:leaveId',
  validateRequest(updateAnnualLeaveSchema),
  authGuard,
  leaveCtrl.updateAnnualLeave,
);

LeaveRoutes.get('/leave/annual', authGuard, leaveCtrl.getAllAnnualLeaves);

// Absence Leave Routes
LeaveRoutes.post(
  '/leave/absence',
  validateRequest(createAbsenceLeaveSchema),
  authGuard,
  leaveCtrl.createAbsenceLeave,
);

LeaveRoutes.put(
  '/leave/absence/:leaveId',
  validateRequest(updateAbsenceLeaveSchema),
  authGuard,
  leaveCtrl.updateAbsenceLeave,
);

LeaveRoutes.get('/leave/absence', authGuard, leaveCtrl.getAllAbsenceLeaves);

// Sick Leave Routes
LeaveRoutes.post(
  '/leave/sick',
  validateRequest(createSickLeaveSchema),
  authGuard,
  leaveCtrl.createSickLeave,
);

LeaveRoutes.put(
  '/leave/sick/:leaveId',
  validateRequest(updateSickLeaveSchema),
  authGuard,
  leaveCtrl.updateSickLeave,
);

LeaveRoutes.get('/leave/sick', authGuard, leaveCtrl.getAllSickLeaves);

// Get all leaves by employee ID
LeaveRoutes.get(
  '/leave/employee/:employeeId',
  validateRequest(getLeavesByEmployeeSchema),
  authGuard,
  leaveCtrl.getLeavesByEmployee,
);

// General Leave Routes
LeaveRoutes.get(
  '/leave/:leaveId',
  validateRequest(getLeaveSchema),
  authGuard,
  leaveCtrl.getLeave,
);

LeaveRoutes.delete(
  '/leave/:leaveId',
  validateRequest(deleteLeaveSchema),
  authGuard,
  leaveCtrl.deleteLeave,
);

export default LeaveRoutes;
