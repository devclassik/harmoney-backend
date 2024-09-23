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
import { Transaction } from './Transaction';

export enum Currency {
  NAIRA = 'NGN',
  DOLLAR = 'USD',
  EURO = 'EUR',
  POUND = 'GBP',
}

export enum NubanProvider {
  PAYSTACK = 'PAYSTACK',
  SAFE_HAVEN = 'SAFE_HAVEN',
  SUDO = 'SUDO',
}

export enum WalletType {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
}

@Entity('wallets')
export class Wallet {
  constructor(data: Wallet) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  mainBalance?: number;

  @Column({ type: 'decimal', precision: 15, scale: 8, default: 0.0 })
  bookBalance?: number;

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

  @Column({ type: 'enum', enum: NubanProvider, nullable: true, default: null })
  nubanProvider?: NubanProvider;

  @Column({ type: 'varchar', nullable: true, default: null })
  txPin?: string;

  @Column({
    type: 'enum',
    enum: WalletType,
    default: WalletType.USER,
    nullable: false,
  })
  wallet_type?: WalletType;

  @OneToOne(() => User, ({ wallet }) => wallet)
  @JoinColumn()
  user?: User;

  @OneToMany(() => Transaction, ({ sourceWallet }) => sourceWallet)
  debitTransactions: Transaction[];

  @OneToMany(() => Transaction, ({ destinationWallet }) => destinationWallet)
  creditTransactions: Transaction[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
