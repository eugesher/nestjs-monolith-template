import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { RoleCreateRequestDto } from '../role-create.request.dto';

describe('RoleCreateRequestDto', () => {
  it.each([
    ['known permission codes', ['ledger:read', 'order:read']],
    ['an empty list', []],
  ])('accepts a name with %s', (_case, permissionCodes) => {
    const dto = plainToInstance(RoleCreateRequestDto, { name: 'auditor', permissionCodes });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing list', { name: 'auditor' }, 'permissionCodes', 'isArray'],
    [
      'an unknown code',
      { name: 'auditor', permissionCodes: ['no:code'] },
      'permissionCodes',
      'isEnum',
    ],
    ['a missing name', { permissionCodes: [] }, 'name', 'isString'],
    ['an empty name', { name: '', permissionCodes: [] }, 'name', 'minLength'],
    ['a name longer than 64', { name: 'a'.repeat(65), permissionCodes: [] }, 'name', 'maxLength'],
  ])('rejects %s', (_case, body, property, constraint) => {
    const dto = plainToInstance(RoleCreateRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
