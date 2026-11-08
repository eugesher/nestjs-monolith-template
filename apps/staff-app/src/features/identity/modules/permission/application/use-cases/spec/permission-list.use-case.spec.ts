import { PermissionCodeEnum } from '@acme-libs/kernel';

import { PermissionListUseCase } from '../permission-list.use-case';

describe('PermissionListUseCase', () => {
  it('answers every code of the enum', () => {
    const view = new PermissionListUseCase().execute();

    expect(view.codes).toEqual(Object.values(PermissionCodeEnum));
    expect(view.codes).toContain('identity:permission:assign');
  });
});
