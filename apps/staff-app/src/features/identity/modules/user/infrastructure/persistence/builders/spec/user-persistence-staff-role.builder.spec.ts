import { DataSource, SelectQueryBuilder } from 'typeorm';

import { RoleEnum } from '@acme-libs/kernel';
import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';

import { UserPersistenceStaffRoleBuilder } from '../user-persistence-staff-role.builder';

describe('UserPersistenceStaffRoleBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<StaffRole>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [StaffPermission, StaffRole, StaffRolePermission],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(StaffRole).createQueryBuilder(StaffRole.name);
  });

  describe('forRole', () => {
    it('selects the id of the role by name', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);

      builder.forRole(RoleEnum.EDITOR);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id` ' +
          'FROM `staff_role` `StaffRole` ' +
          'WHERE `StaffRole`.`name` = ?',
        ['editor'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forRole(RoleEnum.EDITOR);

      expect(chained).toBe(builder);
    });
  });

  describe('forRoles', () => {
    it('selects the ids of the roles with the given names', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);

      builder.forRoles([RoleEnum.EDITOR, RoleEnum.VIEWER]);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id` ' +
          'FROM `staff_role` `StaffRole` ' +
          'WHERE `StaffRole`.`name` IN (?, ?)',
        ['editor', 'viewer'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forRoles([RoleEnum.EDITOR, RoleEnum.VIEWER]);

      expect(chained).toBe(builder);
    });
  });
});
