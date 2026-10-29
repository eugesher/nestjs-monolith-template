import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProductIdRequestDto } from '../product-id-request.dto';

describe('ProductIdRequestDto', () => {
  it.each([
    ['a one-digit id', '7'],
    ['an id of 20 digits', '18446744073709551615'],
  ])('accepts %s', (_case, productId) => {
    const dto = plainToInstance(ProductIdRequestDto, { productId });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['zero', '0'],
    ['a leading zero', '012'],
    ['a negative id', '-1'],
    ['a word', 'abc'],
    ['an id of 21 digits', '1'.repeat(21)],
  ])('rejects %s', (_case, productId) => {
    const dto = plainToInstance(ProductIdRequestDto, { productId });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({ matches: 'productId must be a positive integer' });
  });
});
