import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UserAssignRoleRequestDto } from '../user-assign-role.request.dto';

describe('UserAssignRoleRequestDto', () => {
  it('accepts a role id', () => {
    const dto = plainToInstance(UserAssignRoleRequestDto, { roleId: '3' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a role name', { roleId: 'viewer' }],
    ['a missing role id', {}],
  ])('rejects %s', (_case, body) => {
    const dto = plainToInstance(UserAssignRoleRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('roleId');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(['matches']);
  });
});
