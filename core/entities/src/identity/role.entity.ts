import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { RolePermission } from './role-permission.entity';

@Entity({ name: 'role' })
export class Role {
  @PrimaryGeneratedColumn()
  public id: number;

  @Index('uq_role_name', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  public name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  public description: string | null;

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  public rolePermissions: RolePermission[];
}
