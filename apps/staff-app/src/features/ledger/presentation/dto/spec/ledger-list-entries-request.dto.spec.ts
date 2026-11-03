import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

import { LedgerListEntriesRequestDto } from '../ledger-list-entries-request.dto';

describe('LedgerListEntriesRequestDto', () => {
  it('accepts an empty query string', () => {
    const dto = plainToInstance(LedgerListEntriesRequestDto, {});

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('turns the page window of the query string into numbers', () => {
    const dto = plainToInstance(LedgerListEntriesRequestDto, { page: '2', limit: '50' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
    expect(dto).toEqual({ page: 2, limit: 50 });
  });

  it('accepts every filter', () => {
    const dto = plainToInstance(LedgerListEntriesRequestDto, {
      subjectType: 'product',
      subjectId: '12',
      correlationId: '0b8f4f9e-4c1d-4a8e-9a57-3f1e2d6c7b90',
    });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it('leaves a limit above 100 to the ledger, which caps it', () => {
    const dto = plainToInstance(LedgerListEntriesRequestDto, { limit: '500' });

    const errors = validateSync(dto);

    expect(errors).toEqual([]);
  });

  it.each([
    ['a page of zero', { page: '0' }, 'page', 'min'],
    ['a page that is not a number', { page: 'first' }, 'page', 'isInt'],
    ['a fractional limit', { limit: '2.5' }, 'limit', 'isInt'],
    ['a limit of zero', { limit: '0' }, 'limit', 'min'],
    ['a subject type longer than 64', { subjectType: 'x'.repeat(65) }, 'subjectType', 'maxLength'],
    ['a subject id longer than 64', { subjectId: '1'.repeat(65) }, 'subjectId', 'maxLength'],
    [
      'a correlation id longer than 64',
      { correlationId: 'c'.repeat(65) },
      'correlationId',
      'maxLength',
    ],
  ])('rejects %s', (_case, query, property, constraint) => {
    const dto = plainToInstance(LedgerListEntriesRequestDto, query);

    const errors = validateSync(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe(property);
    expect(Object.keys(errors[0].constraints ?? {})).toContain(constraint);
  });
});
