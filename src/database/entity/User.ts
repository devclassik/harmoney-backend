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
import { Wallet } from './Wallet';
import { MerchantBusiness } from './MerchantBusiness';
import { UserIdentity } from './UserIdentity';
import { Beneficiary } from './Beneficiary';
import { Order } from './Order';

export enum AccountType {
  ADMIN = 'ADMIN',
  CUSTOMER = 'CUSTOMER',
  MERCHANT = 'MERCHANT',
}

@Entity('users')
export class User {
  constructor(data: User) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  first_name?: string;

  @Column({ type: 'varchar', nullable: false })
  last_name?: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  email?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  phone_no?: string;

  @Column({ type: 'varchar', nullable: false })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  confirmEmailToken?: string;

  @Column({ type: 'boolean', default: false })
  isEmailVerified?: boolean;

  @Column({ type: 'varchar', nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  username?: string;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'bool', default: false })
  isLoggedIn?: boolean;

  @Column({ type: 'bool', default: true })
  allowEmailNotification?: boolean;

  @Column({ type: 'bool', default: true })
  allowPushNotification?: boolean;

  @Column({ type: 'enum', enum: AccountType, default: AccountType.CUSTOMER })
  account_type?: AccountType;

  @OneToOne(() => Wallet, ({ user }) => user)
  @JoinColumn()
  wallet?: Wallet;

  @OneToOne(() => MerchantBusiness, ({ merchant }) => merchant)
  @JoinColumn()
  business?: MerchantBusiness;

  @OneToMany(() => UserIdentity, ({ user }) => user)
  identities?: UserIdentity[];

  @OneToMany(() => Beneficiary, ({ owner }) => owner)
  beneficiaries?: Beneficiary[];

  @OneToMany(() => Order, ({ customer }) => customer)
  orders?: Order[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
