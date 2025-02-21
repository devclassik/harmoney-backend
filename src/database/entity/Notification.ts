import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { AppFeatures } from './Permission';
import { Employee } from './Employee';

@Entity()
export class Notification {
  constructor(data: Notification) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({ type: 'enum', enum: AppFeatures, nullable: true })
  feature?: AppFeatures;

  @Column({ type: 'boolean', default: false })
  isRead?: boolean;

  @Column({ type: 'json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToMany(() => Employee, (employee) => employee.notificationsToMe, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  actionTo?: Employee[];

  @ManyToOne(() => Employee, (employee) => employee.notificationsForMe, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  actionFor?: Employee;

  @ManyToOne(() => Employee, (employee) => employee.createdNotifications, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  actionBy?: Employee;
}
