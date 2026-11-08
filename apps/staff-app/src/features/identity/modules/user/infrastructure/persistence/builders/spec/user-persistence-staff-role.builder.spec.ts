import { DataSource, SelectQueryBuilder } from 'typeorm';

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

  describe('forById', () => {
    it('selects the id and the name of the role by id', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);

      builder.forById('2');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name` ' +
          'FROM `staff_role` `StaffRole` ' +
          'WHERE `StaffRole`.`id` = ?',
        ['2'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forById('2');

      expect(chained).toBe(builder);
    });
  });

  describe('forByIds', () => {
    it('selects the ids of the roles with the given ids', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);

      builder.forByIds(['2', '3']);

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id` ' +
          'FROM `staff_role` `StaffRole` ' +
          'WHERE `StaffRole`.`id` IN (?, ?)',
        ['2', '3'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new UserPersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forByIds(['2', '3']);

      expect(chained).toBe(builder);
    });
  });
});
