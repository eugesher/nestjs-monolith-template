import { DataSource, SelectQueryBuilder } from 'typeorm';

import {
  StaffPermission,
  StaffRole,
  StaffRolePermission,
  StaffUser,
  StaffUserRole,
} from '@acme-core/entities';

import { UserPersistenceStaffUserBuilder } from '../user-persistence-staff-user.builder';

describe('UserPersistenceStaffUserBuilder', () => {
  let dataSource: DataSource;
  let baseBuilder: SelectQueryBuilder<StaffUser>;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'mysql',
      database: 'acme',
      entities: [StaffPermission, StaffRole, StaffRolePermission, StaffUser, StaffUserRole],
    });
    jest.spyOn(dataSource.driver, 'connect').mockResolvedValue();
    jest.spyOn(dataSource.driver, 'afterConnect').mockResolvedValue();

    await dataSource.initialize();
  });

  beforeEach(() => {
    baseBuilder = dataSource.getRepository(StaffUser).createQueryBuilder(StaffUser.name);
  });

  describe('forById', () => {
    it('selects the user with the names of its roles', () => {
      const builder = new UserPersistenceStaffUserBuilder(baseBuilder);

      builder.forById('1');

      expect(builder.getQueryAndParameters()).toEqual([
        'SELECT `StaffUser`.`id` AS `StaffUser_id`, `StaffUserRole`.`userId` AS `StaffUserRole_userId`, `StaffUserRole`.`roleId` AS `StaffUserRole_roleId`, `StaffRole`.`id` AS `StaffRole_id`, `StaffRole`.`name` AS `StaffRole_name` ' +
          'FROM `staff_user` `StaffUser` ' +
          'LEFT JOIN `staff_user_roles` `StaffUserRole` ON `StaffUserRole`.`user_id`=`StaffUser`.`id` ' +
          'LEFT JOIN `staff_role` `StaffRole` ON `StaffRole`.`id`=`StaffUserRole`.`role_id` ' +
          'WHERE `StaffUser`.`id` = ?',
        ['1'],
      ]);
    });

    it('returns the same builder for chaining', () => {
      const builder = new UserPersistenceStaffUserBuilder(baseBuilder);
      const chained = builder.forById('1');

      expect(chained).toBe(builder);
    });
  });
});
