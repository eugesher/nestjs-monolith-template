import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { UserRolesReassignRequestDto } from '../user-roles-reassign.request.dto';

describe('UserRolesReassignRequestDto', () => {
  it.each([
    ['a list of role ids', ['2', '3']],
    ['an empty list', []],
  ])('accepts %s', (_case, roleIds) => {
    const dto = plainToInstance(UserRolesReassignRequestDto, { roleIds });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing list', {}, 'isArray'],
    ['a string instead of a list', { roleIds: '2' }, 'isArray'],
    ['a role name among the ids', { roleIds: ['2', 'viewer'] }, 'matches'],
  ])('rejects %s', (_case, body, constraint) => {
    const dto = plainToInstance(UserRolesReassignRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('roleIds');
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
