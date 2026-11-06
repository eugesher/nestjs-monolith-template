import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ReminderGetManyQueryDto } from '../reminder-get-many.query.dto';

describe('ReminderGetManyQueryDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(ReminderGetManyQueryDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers and keeps the status', () => {
    const dto = plainToInstance(ReminderGetManyQueryDto, {
      page: '2',
      limit: '500',
      status: 'done',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 500, status: 'done' });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['isPositive']],
    ['a fractional limit', { limit: '1.5' }, 'limit', ['isInt']],
    ['an unknown status', { status: 'archived' }, 'status', ['isEnum']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(ReminderGetManyQueryDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
