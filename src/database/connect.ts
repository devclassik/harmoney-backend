import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '../config';
import {
  User,
  Accommodation,
  Appraisal,
  AppraisalScore,
  CampMeeting,
  ChurchPosition,
  Discipline,
  Contact,
  Department,
  Document,
  Employee,
  EmployeeCredential,
  EmployeeDocument,
  FamilyMember,
  Payroll,
  Leave,
  Organization,
  Permission,
  Promotion,
  Retirement,
  Retrenchment,
  Role,
  Room,
  Spouse,
  SpiritualHistory,
  Template,
  Transfer,
} from './entity';

export const AppDataSource = new DataSource({
  type: 'mysql',
  url:
    config.db.url ||
    `mysql://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  // url:
  //   config.db.url ||
  //   `postgres://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  synchronize: !!config.db.sync,
  logging: !!config.db.logging,
  ssl: config.app.env === 'local' ? false : { rejectUnauthorized: true },
  entities: [
    User,
    Accommodation,
    Appraisal,
    AppraisalScore,
    CampMeeting,
    ChurchPosition,
    Discipline,
    Contact,
    Department,
    Document,
    Employee,
    EmployeeCredential,
    EmployeeDocument,
    FamilyMember,
    Payroll,
    Leave,
    Organization,
    Permission,
    Promotion,
    Retirement,
    Retrenchment,
    Role,
    Room,
    Spouse,
    SpiritualHistory,
    Template,
    Transfer,
  ],
  migrations: [],
  subscribers: [],
});

//SET GLOBAL sql_mode = NO_ENGINE_SUBSTITUTION
