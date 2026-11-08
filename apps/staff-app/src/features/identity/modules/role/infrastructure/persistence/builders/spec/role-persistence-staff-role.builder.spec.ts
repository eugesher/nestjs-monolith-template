import { DataSource, SelectQueryBuilder } from 'typeorm';

import { StaffPermission, StaffRole, StaffRolePermission } from '@acme-core/entities';

import { RolePersistenceStaffRoleBuilder } from '../role-persistence-staff-role.builder';

describe('RolePersistenceStaffRoleBuilder', () => {
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

  describe('forList', () => {
    it('selects every role with its permissions in id order', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);

      builder.forList();

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name`, ' +
          '`StaffRolePermission`.`roleId` AS `StaffRolePermission_roleId`, ' +
          '`StaffRolePermission`.`permissionId` AS `StaffRolePermission_permissionId`, ' +
          '`StaffPermission`.`id` AS `StaffPermission_id`, ' +
          '`StaffPermission`.`code` AS `StaffPermission_code` ' +
          'FROM `staff_role` `StaffRole` ' +
          'LEFT JOIN `staff_role_permissions` `StaffRolePermission` ON ' +
          '`StaffRolePermission`.`role_id`=`StaffRole`.`id` ' +
          'LEFT JOIN `staff_permission` `StaffPermission` ON ' +
          '`StaffPermission`.`id`=`StaffRolePermission`.`permission_id` ' +
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

  describe('forRole', () => {
    it('selects the role with its permissions by name', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);

      builder.forRole('editor');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name`, ' +
          '`StaffRolePermission`.`roleId` AS `StaffRolePermission_roleId`, ' +
          '`StaffRolePermission`.`permissionId` AS `StaffRolePermission_permissionId`, ' +
          '`StaffPermission`.`id` AS `StaffPermission_id`, ' +
          '`StaffPermission`.`code` AS `StaffPermission_code` ' +
          'FROM `staff_role` `StaffRole` ' +
          'LEFT JOIN `staff_role_permissions` `StaffRolePermission` ON ' +
          '`StaffRolePermission`.`role_id`=`StaffRole`.`id` ' +
          'LEFT JOIN `staff_permission` `StaffPermission` ON ' +
          '`StaffPermission`.`id`=`StaffRolePermission`.`permission_id` ' +
          'WHERE `StaffRole`.`name` = ?',
        ['editor'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new RolePersistenceStaffRoleBuilder(baseBuilder);
      const chained = builder.forRole('editor');

      expect(chained).toBe(builder);
    });
  });
});
