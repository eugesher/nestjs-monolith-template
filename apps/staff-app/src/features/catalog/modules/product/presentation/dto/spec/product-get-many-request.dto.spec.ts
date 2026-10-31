import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ProductGetManyRequestDto } from '../product-get-many-request.dto';

describe('ProductGetManyRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(ProductGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(ProductGetManyRequestDto, { page: '2', size: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, size: 500 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional size', { size: '1.5' }, 'size', ['isInt']],
    ['a word as the page', { page: 'first' }, 'page', ['min', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(ProductGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
