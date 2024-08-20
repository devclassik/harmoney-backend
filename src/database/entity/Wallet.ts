import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./User";

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


@Entity("wallets")
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

  @Column({ type: 'double', default: 0 })
  mainBalance?: number;

  @Column({ type: 'double', default: 0 })
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
  

  @ManyToOne(() => User, ({ wallets }) => wallets)
  @JoinColumn()
  user?: User;

  
  @CreateDateColumn({ type: "timestamp" })
  createdAt?: Date;

  @UpdateDateColumn({ type: "timestamp"})
  updatedAt?: Date;

  @DeleteDateColumn({ type: "timestamp"})
  deletedAt?: Date;
}
