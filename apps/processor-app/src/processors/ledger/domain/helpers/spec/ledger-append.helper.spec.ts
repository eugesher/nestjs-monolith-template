import { LedgerAppendHelper } from '../ledger-append.helper';

describe('LedgerAppendHelper', () => {
  describe('parseInstant', () => {
    it.each([
      ['2026-01-01T00:00:00.000Z', '2026-01-01T00:00:00.000Z'],
      ['2026-01-01T03:00:00+03:00', '2026-01-01T00:00:00.000Z'],
      ['2026-01-01T03:00:00+0300', '2026-01-01T00:00:00.000Z'],
      ['2025-12-31T19:00:00-05:00', '2026-01-01T00:00:00.000Z'],
    ])('reads %s as the instant %s', (value, instant) => {
      const parsed = LedgerAppendHelper.parseInstant(value, 'occurredAt');

      expect(parsed.toISOString()).toBe(instant);
    });

    it('rejects a local time without a zone, which would be read in the server zone', () => {
      expect(() => LedgerAppendHelper.parseInstant('2026-01-01T00:00:00', 'occurredAt')).toThrow(
        'occurredAt must be an ISO-8601 instant with an ' +
          'explicit timezone offset, got 2026-01-01T00:00:00',
      );
    });

    it('rejects a zoned value that is not a date', () => {
      expect(() => LedgerAppendHelper.parseInstant('not-a-dateZ', 'occurredAt')).toThrow(
        'occurredAt is not a valid instant: not-a-dateZ',
      );
    });
  });
});
