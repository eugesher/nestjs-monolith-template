import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'permission' })
export class Permission {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('uq_permission_code', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string | null;
}
