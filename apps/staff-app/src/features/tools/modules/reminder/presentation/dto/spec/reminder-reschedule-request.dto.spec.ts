import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ReminderRescheduleRequestDto } from '../reminder-reschedule-request.dto';

describe('ReminderRescheduleRequestDto', () => {
  it('accepts a calendar date', () => {
    const dto = plainToInstance(ReminderRescheduleRequestDto, { dueOn: '2026-07-01' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['an instant', '2026-07-01T00:00:00Z'],
    ['an empty string', ''],
  ])('rejects %s', (_case, dueOn) => {
    const dto = plainToInstance(ReminderRescheduleRequestDto, { dueOn });

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].constraints).toEqual({
      matches: 'dueOn must be a calendar date formatted YYYY-MM-DD',
    });
  });

  it('rejects a missing date', () => {
    const dto = plainToInstance(ReminderRescheduleRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(Object.keys(errors[0].constraints ?? {})).toEqual(['matches', 'isString']);
  });
});
