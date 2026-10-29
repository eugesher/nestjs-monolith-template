import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ItemCreateRequestDto } from '../item-create-request.dto';

describe('ItemCreateRequestDto', () => {
  it('accepts a valid sku and name', () => {
    const dto = plainToInstance(ItemCreateRequestDto, { sku: 'SKU-1001', name: 'Lamp' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a lowercase sku', 'sku-1001'],
    ['a sku of two characters', 'AB'],
    ['a sku of 65 characters', `A${'B'.repeat(64)}`],
    ['a sku starting with a dash', '-SKU'],
  ])('rejects %s', (_case, sku) => {
    const dto = plainToInstance(ItemCreateRequestDto, { sku, name: 'Lamp' });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('sku');
    expect(errors[0].constraints).toEqual({
      matches: 'sku must be uppercase alphanumeric with dashes, 3-64 chars',
    });
  });

  it.each([
    ['an empty name', '', ['minLength']],
    ['a name of 256 characters', 'n'.repeat(256), ['maxLength']],
    ['a missing name', undefined, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, name, constraints) => {
    const dto = plainToInstance(ItemCreateRequestDto, { sku: 'SKU-1001', name });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('name');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
