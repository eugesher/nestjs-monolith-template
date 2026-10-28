import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ItemGetManyRequestDto } from '../item-get-many-request.dto';

describe('ItemGetManyRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(ItemGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers', () => {
    const dto = plainToInstance(ItemGetManyRequestDto, { page: '2', size: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, size: 500 });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional size', { size: '1.5' }, 'size', ['isInt']],
    ['a word as the page', { page: 'first' }, 'page', ['min', 'isInt']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(ItemGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
