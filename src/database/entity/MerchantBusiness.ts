import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { UserIdentity } from './UserIdentity';
import { Order } from './Order';
import { MerchantService } from './MerchantService';
import { MerchantLocation } from './MerchantLocation';

export enum BusinessCategories {
  WATER = 'WATER',
  GAS = 'GAS',
  INSURANCE = 'INSURANCE',
  APARTMENT = 'APARTMENT',
  EDUCATION = 'EDUCATION',
  GOVERNMENT_PAYMENTS = 'GOVERNMENT_PAYMENTS',
  EMBASSIES = 'EMBASSIES',
  BUS = 'BUS',
  TRAIN = 'TRAIN',
  FLIGHT = 'FLIGHT',
  HOTEL = 'HOTEL',
  MOVIES = 'MOVIES',
  EVENT_TICKETING = 'EVENT_TICKETING',
  PHARMACY = 'PHARMACY',
  BLOOD_BANK = 'BLOOD_BANK',
  HOSPITAL = 'HOSPITAL',
  DOCTOR_CONSULT = 'DOCTOR_CONSULT',
}

export enum BusinessType {
  SOLE_PROPRIETORSHIP = 'SOLE_PROPRIETORSHIP',
  PARTNERSHIP = 'PARTNERSHIP',
  LIMITED_LIABILITY_COMPANY = 'LIMITED_LIABILITY_COMPANY',
  PUBLIC_LIABILITY_COMPANY = 'PUBLIC_LIABILITY_COMPANY',
  COMPANY_LIMITED_BY_GUARANTEE = 'COMPANY_LIMITED_BY_GUARANTEE',
  INCORPORATED_TRUSTEE = 'INCORPORATED_TRUSTEE',
}

export enum ActivationStatus {
  PENDING = 'PENDING',
  ACTIVATE = 'ACTIVATE',
  REJECT = 'REJECT',
}

@Entity('merchant_businesses')
export class MerchantBusiness {
  constructor(data: MerchantBusiness) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: BusinessCategories })
  category?: BusinessCategories;

  @Column({ type: 'text', default: null, nullable: true })
  address?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountNumber?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankCode?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  regNumber?: string;

  @Column({ type: 'enum', enum: BusinessType, default: null, nullable: true })
  business_type?: BusinessType;

  @Column({ type: 'varchar', default: null, nullable: true })
  registered_name?: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: ActivationStatus,
    default: ActivationStatus.PENDING,
    nullable: false,
  })
  activation_status?: ActivationStatus;

  @OneToOne(() => User, ({ business }) => business)
  @JoinColumn()
  merchant?: User;

  @OneToMany(() => UserIdentity, ({ business }) => business)
  identities?: UserIdentity[];

  @OneToMany(() => Order, ({ business }) => business)
  orders?: Order[];

  @OneToMany(() => MerchantService, ({ business }) => business)
  services?: MerchantService[];

  @OneToMany(() => MerchantLocation, ({ business }) => business)
  locations?: MerchantLocation[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
