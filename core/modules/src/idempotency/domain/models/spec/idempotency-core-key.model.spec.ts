import { IdempotencyStatusEnum } from '@acme-libs/kernel';

import { IdempotencyCoreKeyModel } from '../idempotency-core-key.model';

describe('IdempotencyCoreKeyModel', () => {
  describe('reconstitute', () => {
    it('restores every field of the record, frozen', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: '{"id":"12"}',
      });

      expect({ ...key }).toEqual({
        requestFingerprint: 'abc',
        status: 'completed',
        responseBody: '{"id":"12"}',
      });
      expect(Object.isFrozen(key)).toBe(true);
    });
  });

  describe('createDraft', () => {
    it('drafts an in-flight key without a stored response', () => {
      const draft = IdempotencyCoreKeyModel.createDraft({
        key: 'key-1',
        requestFingerprint: 'abc',
      });

      expect(draft).toEqual({
        key: 'key-1',
        requestFingerprint: 'abc',
        status: 'in_flight',
        responseBody: null,
      });
    });

    it('accepts a key of 128 characters', () => {
      const draft = IdempotencyCoreKeyModel.createDraft({
        key: 'k'.repeat(128),
        requestFingerprint: 'abc',
      });

      expect(draft.key).toHaveLength(128);
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
        IdempotencyCoreKeyModel.createDraft({ key: value, requestFingerprint: 'abc' }),
      ).toThrow(message);
    });
  });

  describe('matches', () => {
    it('is true for the fingerprint the key was claimed with', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.IN_FLIGHT,
        responseBody: null,
      });

      expect(key.matches('abc')).toBe(true);
    });

    it('is false for another fingerprint', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.IN_FLIGHT,
        responseBody: null,
      });

      expect(key.matches('xyz')).toBe(false);
    });
  });

  describe('isCompleted', () => {
    it('is true once the key is completed with a response', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: '{"id":"12"}',
      });

      expect(key.isCompleted()).toBe(true);
    });

    it('is false while the key is in flight', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.IN_FLIGHT,
        responseBody: null,
      });

      expect(key.isCompleted()).toBe(false);
    });

    it('is false for a completed key that lost its response', () => {
      const key = IdempotencyCoreKeyModel.reconstitute({
        requestFingerprint: 'abc',
        status: IdempotencyStatusEnum.COMPLETED,
        responseBody: null,
      });

      expect(key.isCompleted()).toBe(false);
    });
  });
});
