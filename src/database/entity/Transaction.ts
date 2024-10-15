import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Beneficiary } from './Beneficiary';
import { Wallet } from './Wallet';
import { Order } from './Order';

export enum TransactionType {
  DEBIT = 'debit',
  CREDIT = 'credit',
}

export enum TransactionStatus {
  INITIALIZED = 'INITIALIZED',
  AUTHORIZED = 'AUTHORIZED',
  FAILED = 'FAILED',
  SUCCESSFUL = 'SUCCESSFUL',
  PENDING = 'PENDING',
  REVERSED = 'REVERSED',
}

export enum TransactionSource {
  SAFEHAVEN = 'SAFEHAVEN',
  PAYSTACK = 'PAYSTACK',
  FLUTTERWAVE = 'FLUTTERWAVE',
}

export enum TransactionCategory {
  BANK = 'BANK',
  AIRTIME = 'AIRTIME',
  DATA = 'DATA',
  CABLE_TV = 'CABLE_TV',
  ELECTRICITY = 'ELECTRICITY',
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

enum Currency {
  NAIRA = 'NGN',
  DOLLAR = 'USD',
  EURO = 'EUR',
  POUND = 'GBP',
}

@Entity('transactions')
export class Transaction {
  constructor(data: Transaction) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  reference?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  amount?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  currentWalletBalance?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  previousWalletBalance?: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
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

  @Column({ type: 'enum', enum: Currency, default: Currency.NAIRA })
  currency?: Currency;

  @Column({ type: 'varchar', nullable: true })
  recipientCode?: string;

  @Column({ type: 'text', nullable: true, default: null })
  description?: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
    nullable: false,
  })
  type?: TransactionType;

  @Column({
    type: 'enum',
    nullable: false,
    enum: TransactionStatus,
    default: TransactionStatus.INITIALIZED,
  })
  status?: TransactionStatus;

  @Column({
    type: 'enum',
    nullable: true,
    enum: TransactionCategory,
    default: null,
  })
  category?: TransactionCategory;

  @Column({
    type: 'enum',
    nullable: false,
    enum: TransactionSource,
    default: TransactionSource.SAFEHAVEN,
  })
  source?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  sourceRefId?: string;

  @Column({ type: 'text', nullable: true, default: null })
  customer?: string;

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

  @ManyToOne(() => Wallet, ({ creditTransactions }) => creditTransactions)
  @JoinColumn()
  destinationWallet?: Wallet;

  @ManyToOne(() => Wallet, ({ debitTransactions }) => debitTransactions)
  @JoinColumn()
  sourceWallet?: Wallet;

  @ManyToOne(() => Order, ({ transactions }) => transactions)
  @JoinColumn()
  order?: Order;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
