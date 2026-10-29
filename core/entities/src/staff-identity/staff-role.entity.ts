import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { StaffRolePermission } from './staff-role-permission.entity';

@Entity({ name: 'staff_role' })
export class StaffRole {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('uq_staff_role_name', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string | null;

  @OneToMany(() => StaffRolePermission, (rolePermission) => rolePermission.role)
  public rolePermissions: StaffRolePermission[];
}
