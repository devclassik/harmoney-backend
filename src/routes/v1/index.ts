import express from 'express';
import LeaveRoutes from '@/modules/leave/leave.routes';
import AccommodationRoutes from '@/modules/accommodation/accommodation.routes';
import { AuthRoutes } from '@/modules/auth/auth.routes';
import DepartmentRoutes from '@/modules/department/department.routes';
import EmployeeRoutes from '@/modules/employee/employee.routes';
import OrganizationRoutes from '@/modules/organization/organization.routes';
import PermissionRoute from '@/modules/permission/permission.routes';
import TemplateRoutes from '@/modules/template/template.routes';
import AppraisalRoutes from '@/modules/appraisal/appraisal.routes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
Routes.use(DepartmentRoutes);
Routes.use(OrganizationRoutes);
Routes.use(EmployeeRoutes);
Routes.use(PermissionRoute);
Routes.use(AccommodationRoutes);
Routes.use(TemplateRoutes);
Routes.use(LeaveRoutes);
Routes.use(AppraisalRoutes);
