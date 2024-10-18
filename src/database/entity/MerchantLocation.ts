import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MerchantBusiness } from './MerchantBusiness';
import { MerchantService } from './MerchantService';

@Entity('merchant_locations')
export class MerchantLocation {
  constructor(data: MerchantLocation) {
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

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @ManyToOne(() => MerchantBusiness, ({ locations }) => locations)
  @JoinColumn()
  business?: MerchantBusiness;

  @ManyToMany(() => MerchantService, ({ locations }) => locations)
  @JoinTable()
  services?: MerchantService[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
