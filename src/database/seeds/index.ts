import { DataSource } from 'typeorm';
import { seedOrganization } from './organization.seed';
import { seedRolesAndPermissions } from './rolesAndPermissions.seed';

export const seedDatabase = async (dataSource: DataSource) => {
  try {
    await seedOrganization(dataSource);
    await seedRolesAndPermissions(dataSource);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
