import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MerchantBusiness } from './MerchantBusiness';
import { Order } from './Order';
import { MerchantLocation } from './MerchantLocation';

@Entity('merchant_services')
export class MerchantService {
  constructor(data: MerchantService) {
    if (typeof data === 'object') {
      Object.keys(data).forEach((index) => {
        this[index] = data[index];
      });
    }
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: false })
  name?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.0 })
  amount?: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  isFixedAmount?: boolean;

  @Column({ type: 'text', nullable: true, default: '' })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  subServiceName?: string;

  @ManyToOne(() => MerchantBusiness, ({ services }) => services)
  @JoinColumn()
  business?: MerchantBusiness;

  @ManyToMany(() => MerchantLocation, ({ services }) => services)
  locations?: MerchantLocation[];

  @OneToMany(() => Order, ({ business }) => business)
  orders?: Order[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
