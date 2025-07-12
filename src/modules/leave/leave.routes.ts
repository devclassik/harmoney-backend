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
  getLeavesByTypeSchema,
  getLeavesByTypeAndEmployeeSchema,
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

// Get leaves by type (annual, absence, sick)
LeaveRoutes.get(
  '/leave/type/:type',
  validateRequest(getLeavesByTypeSchema),
  authGuard,
  leaveCtrl.getLeavesByType,
);

// Get leaves by type and employee ID
LeaveRoutes.get(
  '/leave/type/:type/employee/:employeeId',
  validateRequest(getLeavesByTypeAndEmployeeSchema),
  authGuard,
  leaveCtrl.getLeavesByTypeAndEmployee,
);

// Convenience endpoints for specific leave types by employee
LeaveRoutes.get(
  '/leave/annual/employee/:employeeId',
  validateRequest(getLeavesByEmployeeSchema),
  authGuard,
  leaveCtrl.getAnnualLeavesByEmployee,
);

LeaveRoutes.get(
  '/leave/absence/employee/:employeeId',
  validateRequest(getLeavesByEmployeeSchema),
  authGuard,
  leaveCtrl.getAbsenceLeavesByEmployee,
);

LeaveRoutes.get(
  '/leave/sick/employee/:employeeId',
  validateRequest(getLeavesByEmployeeSchema),
  authGuard,
  leaveCtrl.getSickLeavesByEmployee,
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
