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
import { Employee } from './Employee';
import { ChurchPosition } from './ChurchPosition';
import { Contact } from './Contact';

export enum SpiritualStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Entity()
export class SpiritualHistory {
  constructor(data: SpiritualHistory) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  yearSaved?: string;

  @Column({ type: 'bool', default: false })
  sanctified?: boolean;

  @Column({ type: 'bool', default: false })
  baptizedWithWater?: boolean;

  @Column({ type: 'varchar', nullable: true })
  yearOfWaterBaptism?: string;

  @Column({ type: 'varchar', nullable: true })
  firstYearInChurch?: string;

  @Column({ type: 'bool', default: false })
  isFaithfulInTithing?: boolean;

  @Column({ type: 'varchar', nullable: true, default: null })
  firstSermonPastor?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  currentPastor?: string;

  @Column({ type: 'varchar', nullable: true, default: null })
  dateOfFirstSermon?: string;

  @Column({ type: 'enum', enum: SpiritualStatus, nullable: true })
  spiritualStatus?: SpiritualStatus;

  @OneToOne(() => Contact, { nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn()
  locationOfFirstSermon?: Contact;

  @OneToOne(() => Contact, { nullable: true, cascade: ['insert', 'update'] })
  @JoinColumn()
  currentChurchLocation?: Contact;

  @OneToOne(() => Employee, ({ spiritualHistory }) => spiritualHistory)
  employee?: Employee;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
