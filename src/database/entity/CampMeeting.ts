import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { Room } from './Room';

@Entity()
export class CampMeeting {
  constructor(data: CampMeeting) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  name?: string;

  @Column({ type: 'varchar', default: null, nullable: true })
  agenda?: string;

  @Column({ type: 'date', default: null, nullable: true })
  startDate?: Date;

  @Column({ type: 'date', default: null, nullable: true })
  endDate?: Date;

  @OneToMany(() => Room, ({ campMeeting }) => campMeeting)
  campRooms?: Room[];

  @ManyToMany(() => Employee, ({ campMeetings }) => campMeetings, {
    cascade: ['insert', 'update'],
  })
  @JoinTable()
  attendees: Employee[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
