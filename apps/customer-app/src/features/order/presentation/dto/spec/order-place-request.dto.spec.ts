import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { OrderPlaceRequestDto } from '../order-place-request.dto';

describe('OrderPlaceRequestDto', () => {
  it.each([
    ['one unit', ['100']],
    ['a repeated id for a second unit', ['100', '100']],
    ['100 units', Array.from({ length: 100 }, () => '100')],
    ['an id of 20 digits', ['18446744073709551615']],
  ])('accepts %s', (_case, productIds) => {
    const dto = plainToInstance(OrderPlaceRequestDto, { productIds });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a missing list', {}, 'isArray'],
    ['a string instead of a list', { productIds: '100' }, 'isArray'],
    ['an empty list', { productIds: [] }, 'arrayMinSize'],
    ['101 units', { productIds: Array.from({ length: 101 }, () => '100') }, 'arrayMaxSize'],
    ['an id of zero', { productIds: ['0'] }, 'matches'],
    ['an id with a leading zero', { productIds: ['0100'] }, 'matches'],
    ['a numeric id', { productIds: [100] }, 'matches'],
    ['a word among the ids', { productIds: ['100', 'lamp'] }, 'matches'],
  ])('rejects %s', (_case, body, constraint) => {
    const dto = plainToInstance(OrderPlaceRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('productIds');
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
