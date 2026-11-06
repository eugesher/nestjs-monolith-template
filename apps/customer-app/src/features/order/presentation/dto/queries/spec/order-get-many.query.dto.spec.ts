import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { OrderGetManyQueryDto } from '../order-get-many.query.dto';

describe('OrderGetManyQueryDto', () => {
  it('accepts an empty query string', () => {
    const dto = plainToInstance(OrderGetManyQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the page window of the query string into numbers', () => {
    const dto = plainToInstance(OrderGetManyQueryDto, { page: '2', limit: '50' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 50 });
  });

  it('leaves a limit above 100 to the use case, which caps it', () => {
    const dto = plainToInstance(OrderGetManyQueryDto, { limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a page of zero', { page: '0' }, 'page', 'min'],
    ['a page that is not a number', { page: 'first' }, 'page', 'isInt'],
    ['a fractional limit', { limit: '2.5' }, 'limit', 'isInt'],
    ['a limit of zero', { limit: '0' }, 'limit', 'min'],
  ])('rejects %s', (_case, query, property, constraint) => {
    const dto = plainToInstance(OrderGetManyQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
