import { DataSource, type SelectQueryBuilder } from 'typeorm';

import { StaffRole, StaffRolePermission, StaffUser, StaffUserRole } from '@acme-core/entities';

import { StaffAuthCorePersistenceStaffUserBuilder } from '../staff-auth-core-persistence-staff-user.builder';

describe('StaffAuthCorePersistenceStaffUserBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<StaffUser>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [StaffRole, StaffRolePermission, StaffUser, StaffUserRole],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(StaffUser).createQueryBuilder(StaffUser.name);
  });

  describe('forByEmail', () => {
    it('selects the credentials and status of the user with the email', () => {
      const builder = new StaffAuthCorePersistenceStaffUserBuilder(baseBuilder);

      builder.forByEmail('admin@example.com');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffUser`.`id` AS `StaffUser_id`, `StaffUser`.`passwordHash` AS `StaffUser_passwordHash`, `StaffUser`.`status` AS `StaffUser_status` FROM `staff_user` `StaffUser` WHERE `StaffUser`.`email` = ?',
        ['admin@example.com'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new StaffAuthCorePersistenceStaffUserBuilder(baseBuilder);
      const chained = builder.forByEmail('admin@example.com');

      expect(chained).toBe(builder);
    });
  });

  describe('forActiveById', () => {
    it('selects the active user with its roles and permission codes', () => {
      const builder = new StaffAuthCorePersistenceStaffUserBuilder(baseBuilder);

      builder.forActiveById('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffUser`.`id` AS `StaffUser_id`, `StaffUser`.`email` AS `StaffUser_email`, `StaffUserRole`.`userId` AS `StaffUserRole_userId`, `StaffUserRole`.`roleId` AS `StaffUserRole_roleId`, `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name`, `StaffRolePermission`.`roleId` AS `StaffRolePermission_roleId`, `StaffRolePermission`.`code` AS `StaffRolePermission_code` FROM `staff_user` `StaffUser` LEFT JOIN `staff_user_roles` `StaffUserRole` ON `StaffUserRole`.`user_id`=`StaffUser`.`id` LEFT JOIN `staff_role` `StaffRole` ON `StaffRole`.`id`=`StaffUserRole`.`role_id` LEFT JOIN `staff_role_permissions` `StaffRolePermission` ON `StaffRolePermission`.`role_id`=`StaffRole`.`id` WHERE `StaffUser`.`id` = ? AND `StaffUser`.`status` = ?',
        ['1', 'active'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new StaffAuthCorePersistenceStaffUserBuilder(baseBuilder);
      const chained = builder.forActiveById('1');

      expect(chained).toBe(builder);
    });
  });
});
