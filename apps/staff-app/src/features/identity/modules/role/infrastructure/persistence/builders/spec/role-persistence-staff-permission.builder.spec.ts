import { DataSource, SelectQueryBuilder } from 'typeorm';

import { PermissionCodeEnum } from '@acme-libs/kernel';
import { StaffPermission } from '@acme-core/entities';

import { RolePersistenceStaffPermissionBuilder } from '../role-persistence-staff-permission.builder';

describe('RolePersistenceStaffPermissionBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<StaffPermission>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [StaffPermission],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource
      .getRepository(StaffPermission)
      .createQueryBuilder(StaffPermission.name);
  });

  describe('forPermissions', () => {
    it('selects the permissions with the given codes', () => {
      const builder = new RolePersistenceStaffPermissionBuilder(baseBuilder);

      builder.forPermissions([PermissionCodeEnum.TAG_READ, PermissionCodeEnum.TAG_WRITE]);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffPermission`.`id` AS `StaffPermission_id`, ' +
          '`StaffPermission`.`code` AS `StaffPermission_code` ' +
          'FROM `staff_permission` `StaffPermission` ' +
          'WHERE `StaffPermission`.`code` IN (?, ?)',
        ['tag:read', 'tag:write'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new RolePersistenceStaffPermissionBuilder(baseBuilder);
      const chained = builder.forPermissions([
        PermissionCodeEnum.TAG_READ,
        PermissionCodeEnum.TAG_WRITE,
      ]);

      expect(chained).toBe(builder);
    });
  });
});
