import { AppFeatures, Permission, Role, UserRoles } from '../entity';
import { DataSource } from 'typeorm';

export const seedRolesAndPermissions = async (dataSource: DataSource) => {
  const roleRepository = dataSource.getRepository(Role);
  const permissionRepository = dataSource.getRepository(Permission);

  const rolesCount = await roleRepository.count();
  if (rolesCount > 0) {
    console.log('✅ Roles already exist. Skipping seeding.');
    return;
  }

  console.log('🌱 Seeding roles and permissions...');

  const roleData = Object.values(UserRoles).map(
    (roleName) => new Role({ name: roleName as UserRoles }),
  );

  await roleRepository.save(roleData);
  console.log('✅ Roles seeded.');

  const allRoles = await roleRepository.find();

  const permissionsData: Permission[] = [];

  allRoles.forEach((role) => {
    Object.values(AppFeatures).forEach((feature) => {
      const permission = new Permission({ feature, role });

      // Set default permissions based on role (Customize as needed)
      if (role.name === UserRoles.ADMIN) {
        permission.canView = true;
        permission.canCreate = true;
        permission.canEdit = true;
        permission.canDelete = true;
      } else {
        permission.canView = true;
        permission.canCreate = false;
        permission.canEdit = false;
        permission.canDelete = false;
      }

      permissionsData.push(permission);
    });
  });

  await permissionRepository.save(permissionsData);
  console.log('✅ Permissions seeded.');
};
