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
import { Leave } from '.';
import { DocumentTypes } from '../enum';

@Entity()
export class FileIndex {
  constructor(data: FileIndex) {
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
  fileType?: DocumentTypes;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt?: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt?: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt?: Date;

  @Column({ type: 'boolean', nullable: true })
  isTraining?: boolean;
}
