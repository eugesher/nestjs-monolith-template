import { DataSource, SelectQueryBuilder } from 'typeorm';

import { StaffRole, StaffRolePermission } from '@acme-core/entities';

import { RolePersistenceStaffRoleBuilder } from '../role-persistence-staff-role.builder';

describe('RolePersistenceStaffRoleBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<StaffRole>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [StaffRole, StaffRolePermission],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(StaffRole).createQueryBuilder(StaffRole.name);
  });

  describe('forList', () => {
    it('selects every role with its permissions in id order', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);

      builder.forList();

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name`, ' +
          '`StaffRolePermission`.`roleId` AS `StaffRolePermission_roleId`, ' +
          '`StaffRolePermission`.`code` AS `StaffRolePermission_code` ' +
          'FROM `staff_role` `StaffRole` ' +
          'LEFT JOIN `staff_role_permissions` `StaffRolePermission` ON ' +
          '`StaffRolePermission`.`role_id`=`StaffRole`.`id` ' +
          'ORDER BY `StaffRole_id` ASC',
        [],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forList();

      expect(chained).toBe(builder);
    });
  });

  describe('forById', () => {
    it('selects the role with its permissions by id', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);

      builder.forById('2');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name`, ' +
          '`StaffRolePermission`.`roleId` AS `StaffRolePermission_roleId`, ' +
          '`StaffRolePermission`.`code` AS `StaffRolePermission_code` ' +
          'FROM `staff_role` `StaffRole` ' +
          'LEFT JOIN `staff_role_permissions` `StaffRolePermission` ON ' +
          '`StaffRolePermission`.`role_id`=`StaffRole`.`id` ' +
          'WHERE `StaffRole`.`id` = ?',
        ['2'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forById('2');

      expect(chained).toBe(builder);
    });
  });
});
