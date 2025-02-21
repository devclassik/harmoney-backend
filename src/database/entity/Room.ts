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
import { Employee } from './Employee';
import { Accommodation } from './Accommodation';
import { CampMeeting } from './CampMeeting';

@Entity()
export class Room {
  constructor(data: Room) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', default: null, nullable: true })
  name?: string;

  @Column({ type: 'double', default: null, nullable: true })
  capacity?: number;

  @ManyToOne(() => Accommodation, ({ rooms }) => rooms)
  @JoinColumn()
  accommodation?: Accommodation;

  @ManyToOne(() => CampMeeting, ({ campRooms }) => campRooms)
  campMeeting?: CampMeeting;

  @ManyToMany(() => Employee, ({ campRooms }) => campRooms)
  @JoinTable()
  occupants?: Employee[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;
}
