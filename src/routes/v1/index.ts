import express from 'express';
import { AuthRoutes } from '../../modules/auth/auth.routes';
import DepartmentRoutes from '../../modules/department/department.routes';
import OrganizationRoutes from '../../modules/organization/organization.routes';
import EmployeeRoutes from '../../modules/employee/employee.routes';
import PermissionRoute from '../../modules/permission/permission.routes';
import AccommodationRoutes from '../../modules/accommodation/accommodation.routes';
import TemplateRoutes from '../../modules/template/template.routes';

export const Routes = express.Router();

Routes.use(AuthRoutes);
Routes.use(DepartmentRoutes);
Routes.use(OrganizationRoutes);
Routes.use(EmployeeRoutes);
Routes.use(PermissionRoute);
Routes.use(AccommodationRoutes);
Routes.use(TemplateRoutes);
