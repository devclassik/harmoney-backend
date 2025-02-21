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
  OneToMany,
} from 'typeorm';
import { AppFeatures } from './Permission';
import { Employee } from './Employee';
import { Document } from './Document';

@Entity()
export class AppMessage {
  constructor(data: AppMessage) {
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

  @ManyToMany(() => Employee, (employee) => employee.messagesToMe, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  actionTo?: Employee[];

  @ManyToOne(() => Employee, (employee) => employee.messagesForMe, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  actionFor?: Employee;

  @ManyToOne(() => Employee, (employee) => employee.createdMessages, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  actionBy?: Employee;

  @OneToMany(() => Document, ({ appMessage }) => appMessage, {
    cascade: ['insert', 'update'],
  })
  @JoinColumn()
  attachments?: Document[];
}
