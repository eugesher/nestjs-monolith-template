import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { RolePermissionsReassignRequestDto } from '../role-permissions-reassign.request.dto';

describe('RolePermissionsReassignRequestDto', () => {
  it('accepts known permission codes', () => {
    const dto = plainToInstance(RolePermissionsReassignRequestDto, {
      permissionCodes: ['access-management', 'ledger:read'],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an empty list', { permissionCodes: [] }, 'arrayNotEmpty'],
    ['an unknown code', { permissionCodes: ['access-management', 'does-not:exist'] }, 'isEnum'],
    ['codes that are not a list', { permissionCodes: 'access-management' }, 'isArray'],
  ])('rejects %s', (_case, body, constraint) => {
    const dto = plainToInstance(RolePermissionsReassignRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('permissionCodes');
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
