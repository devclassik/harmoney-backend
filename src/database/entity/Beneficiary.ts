import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';

export enum BeneficiaryType {
  BILLS = 'BILLS',
  TRANSFERS = 'TRANSFERS',
}

@Entity('beneficiaries')
export class Beneficiary {
  constructor(data: Beneficiary) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  alias?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountNumber?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  accountName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankName?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  bankCode?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  reference?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  billerCode?: string;

  @Column({ type: 'numeric', default: 0 })
  billerCategoryId?: number;

  @Column({
    type: 'enum',
    enum: BeneficiaryType,
    default: BeneficiaryType.TRANSFERS,
  })
  type?: BeneficiaryType;

  @ManyToOne(() => User, ({ beneficiaries }) => beneficiaries)
  @JoinColumn()
  owner?: User;

  @OneToMany(() => Transaction, ({ beneficiary }) => beneficiary)
  transactions?: Transaction[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
