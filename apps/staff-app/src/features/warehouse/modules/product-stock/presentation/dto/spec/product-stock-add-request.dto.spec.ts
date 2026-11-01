import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProductStockAddRequestDto } from '../product-stock-add-request.dto';

describe('ProductStockAddRequestDto', () => {
  it.each([
    ['one unit', 1],
    ['100000 units', 100_000],
  ])('accepts %s', (_case, quantity) => {
    const dto = plainToInstance(ProductStockAddRequestDto, { quantity });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['zero', 0, ['min']],
    ['a negative quantity', -3, ['min']],
    ['a fraction', 2.5, ['isInt']],
    ['more than 100000', 100_001, ['max']],
    ['a string of digits', '5', ['max', 'min', 'isInt']],
  ])('rejects %s', (_case, quantity, constraints) => {
    const dto = plainToInstance(ProductStockAddRequestDto, { quantity });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('quantity');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
