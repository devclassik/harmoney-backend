import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';
import { Employee } from './Employee';
import { ChurchPosition } from './ChurchPosition';
import { Contact } from './Contact';
import { Leave } from '.';

export enum DocumentTypes {
  PDF = 'pdf',
  XLS = 'xls',
  DOC = 'doc',
}

@Entity()
export class Document {
  constructor(data: Document) {
    Object.assign(this, data);
  }

  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'varchar', nullable: true })
  documentId?: string;

  @Column({ type: 'varchar', nullable: true })
  name?: string;

  @Column({ type: 'varchar', nullable: true })
  downloadUrl?: string;

  @Column({ type: 'enum', enum: DocumentTypes, default: DocumentTypes.PDF })
  type?: DocumentTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  @ManyToOne(() => Leave, ({ leaveNotes }) => leaveNotes)
  leave?: Leave;
}
