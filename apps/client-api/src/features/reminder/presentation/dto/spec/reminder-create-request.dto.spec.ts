import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ReminderCreateRequestDto } from '../reminder-create-request.dto';

describe('ReminderCreateRequestDto', () => {
  it.each([
    ['a reminder without a body', { title: 'Renew', dueOn: '2026-06-01' }],
    ['a reminder with a body', { title: 'Renew', body: 'The annual one', dueOn: '2026-06-01' }],
    ['an empty body', { title: 'Renew', body: '', dueOn: '2026-06-01' }],
  ])('accepts %s', (_case, body) => {
    const dto = plainToInstance(ReminderCreateRequestDto, body);

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an empty title', '', ['minLength']],
    ['a title of 256 characters', 't'.repeat(256), ['maxLength']],
    ['a missing title', undefined, ['maxLength', 'minLength', 'isString']],
  ])('rejects %s', (_case, title, constraints) => {
    const dto = plainToInstance(ReminderCreateRequestDto, { title, dueOn: '2026-06-01' });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('title');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });

  it.each([
    ['a body of 2001 characters', 'b'.repeat(2001), ['maxLength']],
    ['a number as the body', 7, ['maxLength', 'isString']],
  ])('rejects %s', (_case, body, constraints) => {
    const dto = plainToInstance(ReminderCreateRequestDto, {
      title: 'Renew',
      body,
      dueOn: '2026-06-01',
    });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('body');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(constraints);
  });

  it.each([
    ['an instant', '2026-06-01T00:00:00Z'],
    ['a day before the month', '01-06-2026'],
    ['a date without zero padding', '2026-6-1'],
  ])('rejects %s as the due date', (_case, dueOn) => {
    const dto = plainToInstance(ReminderCreateRequestDto, { title: 'Renew', dueOn });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('dueOn');
    expect(errors[0].constraints).toEqual({
      matches: 'dueOn must be a calendar date formatted YYYY-MM-DD',
    });
  });

  it('rejects a missing due date', () => {
    const dto = plainToInstance(ReminderCreateRequestDto, { title: 'Renew' });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('dueOn');
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(['matches', 'isString']);
  });
});
