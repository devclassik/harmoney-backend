import 'reflect-metadata';
import { DataSource } from 'typeorm';
import config from '../config';
import {
  User,
  MerchantBusiness,
  Wallet,
  UserIdentity,
  Transaction,
  Beneficiary,
  Order,
  MerchantService,
  SafeHavenService,
} from './entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url:
    config.db.url ||
    `postgres://${config.db.username}:${config.db.password}@${config.db.host}:${config.db.port}/${config.db.name}`,
  synchronize: !!config.db.sync,
  logging: !!config.db.logging,
  ssl: config.app.env === 'local' ? false : { rejectUnauthorized: false },
  entities: [
    User,
    MerchantBusiness,
    MerchantService,
    Wallet,
    UserIdentity,
    Transaction,
    Beneficiary,
    Order,
    SafeHavenService,
  ],
  migrations: [],
  subscribers: [],
});

//SET GLOBAL sql_mode = NO_ENGINE_SUBSTITUTION
