import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './Room';

export enum AccommodationTypes {
  HOTEL = 'HOTEL',
  GUEST_HOUSE = 'GUEST_HOUSE',
  HOSTEL = 'HOSTEL',
}

@Entity()
export class Accommodation {
  constructor(data: Accommodation) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'enum', enum: AccommodationTypes, nullable: true })
  type?: AccommodationTypes;

  @Column({ type: 'boolean', default: false })
  isPetAllowed?: boolean;

  @OneToMany(() => Room, ({ accommodation }) => accommodation, {
    cascade: ['insert', 'update'],
  })
  rooms?: Room[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
