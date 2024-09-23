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
import { User } from './User';
import { MerchantBusiness } from './MerchantBusiness';
import { Transaction } from './Transaction';

export enum OrderStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  ACCEPTED = 'ACCEPTED',
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

  @Column({ type: 'text', nullable: true, default: '' })
  note?: string;

  @Column({
    type: 'varchar',
    nullable: false,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status?: OrderStatus;

  @Column({ type: 'varchar', nullable: true, default: null })
  utilityToken?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  customerAddress?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  customerName?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  serviceRequested?: string;

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
