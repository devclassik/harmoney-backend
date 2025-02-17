import { Department, Organization } from '../entity';
import { DataSource } from 'typeorm';

export const seedOrganization = async (dataSource: DataSource) => {
  try {
    const organizationRepo = dataSource.getRepository(Organization);
    const departmentRepo = dataSource.getRepository(Department);

    // Check if an organization already exists
    const existingOrganization = await organizationRepo.count();

    if (existingOrganization) {
      console.log('✅ Organization already exists. Skipping seeding.');
      return;
    }

    console.log(
      '🌱 Seeding database: Creating default organization and head department...',
    );

    // Create a new organization
    const organization = organizationRepo.create({
      name: 'Harmony Group of Companies',
    });
    await organizationRepo.save(organization);

    // Create a new head department
    const headDepartment = departmentRepo.create({
      name: 'Director Superintendent Admin',
      organization,
    });
    await departmentRepo.save(headDepartment);

    // Set the head department for the organization
    organization.headDepartment = headDepartment;
    await organizationRepo.save(organization);

    console.log('✅ Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
};
