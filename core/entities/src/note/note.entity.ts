import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

@Entity({ name: 'note' })
@Index('idx_note_subject', ['subjectType', 'subjectId'])
export class Note {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  public id: string;

  @Column({ type: 'varchar', length: 64 })
  public subjectType: string;

  @Column({ type: 'varchar', length: 64 })
  public subjectId: string;

  @Column({ type: 'text' })
  public body: string;

  @Index('idx_note_author')
  @Column({ type: 'char', length: 36 })
  public authorId: string;

  @Column({ type: 'boolean', default: false })
  public resolved: boolean;

  @VersionColumn({ default: 1 })
  public version: number;

  @CreateDateColumn({ type: 'timestamp', precision: 0, default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    precision: 0,
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  public updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', precision: 0, nullable: true })
  public deletedAt: Date | null;
}
