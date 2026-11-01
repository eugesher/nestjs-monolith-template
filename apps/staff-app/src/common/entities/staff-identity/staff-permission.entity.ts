import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'staff_permission' })
export class StaffPermission {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('uq_staff_permission_code', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string | null;
}
