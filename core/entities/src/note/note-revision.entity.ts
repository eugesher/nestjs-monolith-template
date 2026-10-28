import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Note } from './note.entity';

@Entity({ name: 'note_revision' })
@Index('uq_note_revision_version', ['noteId', 'noteVersion'], { unique: true })
export class NoteRevision {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'bigint', unsigned: true })
  public noteId: string;

  @ManyToOne(() => Note, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'note_id', foreignKeyConstraintName: 'fk_note_revision_note' })
  public note: Note;

  @Column({ type: 'int' })
  public noteVersion: number;

  @Column({ type: 'text' })
  public bodyBefore: string;

  @Column({ type: 'text' })
  public bodyAfter: string;

  @Column({ type: 'char', length: 36 })
  public editorId: string;

  @Index('idx_note_revision_correlation')
  @Column({ type: 'varchar', length: 64, default: '' })
  public correlationId: string;

  @CreateDateColumn({ type: 'timestamp', precision: 3, default: () => 'CURRENT_TIMESTAMP(3)' })
  public recordedAt: Date;
}
