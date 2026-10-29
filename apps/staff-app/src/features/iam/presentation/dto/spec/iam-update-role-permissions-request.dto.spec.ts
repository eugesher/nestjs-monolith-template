import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { IamUpdateRolePermissionsRequestDto } from '../iam-update-role-permissions-request.dto';

describe('IamUpdateRolePermissionsRequestDto', () => {
  it('accepts known permission codes', () => {
    const dto = plainToInstance(IamUpdateRolePermissionsRequestDto, {
      permissionCodes: ['iam:assign', 'ledger:read'],
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an empty list', { permissionCodes: [] }, 'arrayNotEmpty'],
    ['an unknown code', { permissionCodes: ['iam:assign', 'does-not:exist'] }, 'isEnum'],
    ['codes that are not a list', { permissionCodes: 'iam:assign' }, 'isArray'],
  ])('rejects %s', (_case, body, constraint) => {
    const dto = plainToInstance(IamUpdateRolePermissionsRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('permissionCodes');
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
