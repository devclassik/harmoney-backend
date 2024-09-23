import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Beneficiary } from './Beneficiary';
import { User } from './User';
import { Currency, Wallet } from './Wallet';
import { MerchantBusiness } from './MerchantBusiness';
import { Transaction } from './Transaction';

export enum OrderStatus {
  PENDING = 'PENDING',
  REVERSED = 'REVERSED',
}

export enum OrderCategory {
  AIRTIME = 'AIRTIME',
  DATA = 'DATA',
  CABLE_TV = 'CABLE_TV',
  INTERNET = 'INTERNET',
  WATER = 'WATER',
  GAS = 'GAS',
  INSURANCE = 'INSURANCE',
  APARTMENT = 'APARTMENT',
  EDUCATION = 'EDUCATION',
  GOVERNMENT = 'GOVERNMENT',
  EMBASSY = 'EMBASSY',
  HOTEL = 'HOTEL',
  BUS_TICKET = 'BUS_TICKET',
  TRAIN_TICKET = 'TRAIN_TICKET',
  FLIGHT_TICKET = 'FLIGHT_TICKET',
  MOVIE_TICKET = 'MOVIE_TICKET',
  EVENT_TICKET = 'EVENT_TICKET',
  PHARMACY = 'PHARMACY',
  BLOOD_BANK = 'BLOOD_BANK',
  HOSPITAL = 'HOSPITAL',
  DOCTOR_CONSULT = 'DOCTOR_CONSULT',
}

@Entity('orders')
export class Order {
  constructor(data: Order) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  reference?: string;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  amount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  currentWalletBalance?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  previousWalletBalance?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  fee?: number;

  @Column({ type: 'boolean', default: false })
  isExternal?: boolean;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountNumber?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankCode?: string;

  // @Column({ type: 'enum', enum: Currency, default: Currency.NAIRA })
  // currency?: Currency;

  @Column({ type: 'varchar', nullable: true })
  recipientCode?: string;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ type: 'text', nullable: true })
  transactionToken?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status?: OrderStatus;

  @Column({
    type: 'varchar',
    nullable: true,
    enum: OrderCategory,
    default: null,
  })
  category?: OrderCategory;

  @Column({ type: 'varchar', nullable: true, default: null })
  utilityToken?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  customerAddress?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  customerName?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  serviceProvider?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  bundle?: string;

  @ManyToOne(() => Beneficiary, ({ transactions }) => transactions)
  @JoinColumn()
  beneficiary?: Beneficiary;

  @ManyToOne(() => Wallet)
  @JoinColumn()
  beneficiaryWallet?: Wallet;

  @ManyToOne(() => Wallet)
  @JoinColumn()
  senderWallet?: Wallet;

  @ManyToOne(() => User, ({ orders }) => orders)
  @JoinColumn()
  customer?: User;

  @ManyToOne(() => MerchantBusiness, ({ orders }) => orders)
  @JoinColumn()
  business?: MerchantBusiness;

  @OneToOne(() => Transaction, ({ order }) => order)
  @JoinColumn()
  transaction?: Transaction;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
