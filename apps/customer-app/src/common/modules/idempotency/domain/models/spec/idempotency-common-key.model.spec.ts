import { IdempotencyStatusEnum } from '@acme-libs/kernel';
import { IdempotencyCommonKeyModel } from '../idempotency-common-key.model';

describe('IdempotencyCommonKeyModel', () => {
  describe('claim', () => {
    it('opens an in-flight key without a stored response', () => {
      const key = IdempotencyCommonKeyModel.claim({ key: 'key-1', requestFingerprint: 'abc' });

      expect({ ...key }).toEqual({
        id: undefined,
        key: 'key-1',
        requestFingerprint: 'abc',
        status: 'in_flight',
        responseBody: null,
        createdAt: undefined,
      });
    });

    it('accepts a key of 128 characters', () => {
      const key = IdempotencyCommonKeyModel.claim({
        key: 'k'.repeat(128),
        requestFingerprint: 'abc',
      });

      expect(key.key).toHaveLength(128);
    });

    it('is frozen', () => {
      const key = IdempotencyCommonKeyModel.claim({ key: 'key-1', requestFingerprint: 'abc' });

      expect(Object.isFrozen(key)).toBe(true);
    });

    it.each([
      ['an empty key', '', 'IdempotencyKey.key is required'],
      [
        'a key longer than 128',
        'k'.repeat(129),
        'IdempotencyKey.key must be at most 128 characters',
      ],
    ])('refuses %s', (_case, value, message) => {
      expect(() =>
        IdempotencyCommonKeyModel.claim({ key: value, requestFingerprint: 'abc' }),
      ).toThrow(message);
    });
  });

  describe('reconstitute', () => {
    it('restores every field of the record', () => {
      const key = IdempotencyCommonKeyModel.reconstitute({
        id: '7',
        key: 'key-1',
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: '{"id":"12"}',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect({ ...key }).toEqual({
        id: '7',
        key: 'key-1',
        requestFingerprint: 'abc',
        status: 'completed',
        responseBody: '{"id":"12"}',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });
  });

  describe('expiryCutoff', () => {
    it('is the instant that lies the TTL before now', () => {
      const cutoff = IdempotencyCommonKeyModel.expiryCutoff(
        new Date('2026-01-02T12:00:00.000Z'),
        24,
      );

      expect(cutoff).toEqual(new Date('2026-01-01T12:00:00.000Z'));
    });
  });

  describe('matches', () => {
    it('is true for the fingerprint the key was claimed with', () => {
      const key = IdempotencyCommonKeyModel.claim({ key: 'key-1', requestFingerprint: 'abc' });

      expect(key.matches('abc')).toBe(true);
    });

    it('is false for another fingerprint', () => {
      const key = IdempotencyCommonKeyModel.claim({ key: 'key-1', requestFingerprint: 'abc' });

      expect(key.matches('xyz')).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('is true once the key is completed with a response', () => {
      const key = IdempotencyCommonKeyModel.reconstitute({
        id: '7',
        key: 'key-1',
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: '{"id":"12"}',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(key.isCompleted()).toBe(true);
    });

    it('is false while the key is in flight', () => {
      const key = IdempotencyCommonKeyModel.claim({ key: 'key-1', requestFingerprint: 'abc' });

      expect(key.isCompleted()).toBe(false);
    });

    it('is false for a completed key that lost its response', () => {
      const key = IdempotencyCommonKeyModel.reconstitute({
        id: '7',
        key: 'key-1',
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(key.isCompleted()).toBe(false);
    });
  });
});
