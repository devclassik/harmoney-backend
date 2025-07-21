import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Employee } from './Employee';
import { CampMeeting } from './CampMeeting';
import { Room } from './Room';

@Entity('camp_meeting_attendees')
export class CampMeetingAttendee {
    constructor(data: CampMeetingAttendee) {
        Object.assign(this, data);
    }

    @PrimaryGeneratedColumn()
    id?: number;

    @ManyToOne(() => CampMeeting, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'camp_meeting_id' })
    campMeeting?: CampMeeting;

    @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'employee_id' })
    employee?: Employee;

    @ManyToOne(() => Room, { nullable: true })
    @JoinColumn({ name: 'room_id' })
    assignedRoom?: Room;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt?: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt?: Date;

    @DeleteDateColumn({ type: 'timestamp' })
    deletedAt?: Date;
} 