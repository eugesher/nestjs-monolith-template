import { SelectQueryBuilder } from 'typeorm';

import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffPermission } from '@acme-core/entities';

export class RolePersistenceStaffPermissionBuilder extends SelectQueryBuilder<StaffPermission> {
  public forPermissions(codes: PermissionCodeEnum[]): this {
    this.select([`${this.alias}.id`, `${this.alias}.code`]).where(
      `${this.alias}.code IN (:...codes)`,
      { codes },
    );

    return this;
  }
}
