import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ReminderGetManyRequestDto } from '../reminder-get-many-request.dto';

describe('ReminderGetManyRequestDto', () => {
  it('accepts an empty query', () => {
    const dto = plainToInstance(ReminderGetManyRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the query strings into numbers and keeps the status', () => {
    const dto = plainToInstance(ReminderGetManyRequestDto, {
      page: '2',
      size: '500',
      status: 'done',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, size: 500, status: 'done' });
  });

  it.each([
    ['page zero', { page: '0' }, 'page', ['min']],
    ['a fractional size', { size: '1.5' }, 'size', ['isInt']],
    ['an unknown status', { status: 'archived' }, 'status', ['isEnum']],
  ])('rejects %s', (_case, query, property, constraints) => {
    const dto = plainToInstance(ReminderGetManyRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });
});
