import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderModel } from '../reminder.model';

describe('ReminderModel', () => {
  describe('create', () => {
    it('opens a pending reminder at version 1 with a trimmed title and body', () => {
      const reminder = ReminderModel.create({
        ownerId: 'owner-1',
        title: '  Call the bank  ',
        body: '  About the card  ',
        dueOn: '2026-11-05',
      });

      expect(reminder.id).toBeUndefined();
      expect(reminder.ownerId).toBe('owner-1');
      expect(reminder.title).toBe('Call the bank');
      expect(reminder.body).toBe('About the card');
      expect(reminder.dueOn).toBe('2026-11-05');
      expect(reminder.status).toBe('pending');
      expect(reminder.version).toBe(1);
      expect(reminder.createdAt).toBeUndefined();
      expect(reminder.updatedAt).toBeUndefined();
      expect(reminder.pullDomainEvents()).toEqual([]);
    });

    it('accepts an empty body', () => {
      const reminder = ReminderModel.create({
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '   ',
        dueOn: '2026-11-05',
      });

      expect(reminder.body).toBe('');
    });

    it.each([
      ['a blank title', '   '],
      ['a title longer than 255', 't'.repeat(256)],
    ])('refuses %s with REMINDER_TITLE_INVALID', (_, title) => {
      expect(() =>
        ReminderModel.create({ ownerId: 'owner-1', title, body: '', dueOn: '2026-11-05' }),
      ).toThrow(
        expect.objectContaining({
          code: 'REMINDER_TITLE_INVALID',
          message: 'Reminder.title must be a non-empty string of at most 255 characters',
        }) as Error,
      );
    });

    it('accepts a title of 255 characters and a body of 2000', () => {
      const reminder = ReminderModel.create({
        ownerId: 'owner-1',
        title: 't'.repeat(255),
        body: 'b'.repeat(2000),
        dueOn: '2026-11-05',
      });

      expect(reminder.title).toHaveLength(255);
      expect(reminder.body).toHaveLength(2000);
    });

    it('refuses a body longer than 2000 with REMINDER_BODY_INVALID', () => {
      expect(() =>
        ReminderModel.create({
          ownerId: 'owner-1',
          title: 'Call the bank',
          body: 'b'.repeat(2001),
          dueOn: '2026-11-05',
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'REMINDER_BODY_INVALID',
          message: 'Reminder.body must be at most 2000 characters',
        }) as Error,
      );
    });

    it.each([
      ['a date with a time', '2026-11-05T10:00:00Z'],
      ['a date without leading zeros', '2026-11-5'],
      ['an empty string', ''],
    ])('refuses %s as a malformed due date', (_, dueOn) => {
      expect(() =>
        ReminderModel.create({ ownerId: 'owner-1', title: 'Call the bank', body: '', dueOn }),
      ).toThrow(
        expect.objectContaining({
          code: 'REMINDER_DUE_ON_INVALID',
          message: `Reminder.dueOn must be a calendar date formatted YYYY-MM-DD, got ${dueOn}`,
        }) as Error,
      );
    });

    it.each([
      ['the 30th of February', '2026-02-30'],
      ['the 29th of February of a common year', '2026-02-29'],
      ['month 13', '2026-13-01'],
    ])('refuses %s as a date that does not exist', (_, dueOn) => {
      expect(() =>
        ReminderModel.create({ ownerId: 'owner-1', title: 'Call the bank', body: '', dueOn }),
      ).toThrow(
        expect.objectContaining({
          code: 'REMINDER_DUE_ON_INVALID',
          message: `Reminder.dueOn is not a real calendar date: ${dueOn}`,
        }) as Error,
      );
    });

    it('accepts the 29th of February of a leap year', () => {
      const reminder = ReminderModel.create({
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2028-02-29',
      });

      expect(reminder.dueOn).toBe('2028-02-29');
    });
  });

  describe('reconstitute', () => {
    it('restores a stored reminder', () => {
      const reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: 'About the card',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.DONE,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      });

      expect(reminder.id).toBe('7');
      expect(reminder.status).toBe('done');
      expect(reminder.version).toBe(3);
      expect(reminder.createdAt).toEqual(new Date('2026-01-01T00:00:00.000Z'));
      expect(reminder.updatedAt).toEqual(new Date('2026-01-02T00:00:00.000Z'));
    });

    it.each([
      ['zero', 0],
      ['a fraction', 1.5],
    ])('refuses a version of %s with REMINDER_VERSION_INVALID', (_, version) => {
      expect(() =>
        ReminderModel.reconstitute({
          id: '7',
          ownerId: 'owner-1',
          title: 'Call the bank',
          body: '',
          dueOn: '2026-11-05',
          status: ReminderStatusEnum.PENDING,
          version,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ).toThrow(
        expect.objectContaining({
          code: 'REMINDER_VERSION_INVALID',
          message: `Reminder.version must be a positive integer, got ${version}`,
        }) as Error,
      );
    });
  });

  describe('complete', () => {
    it('marks a pending reminder done and bumps the version', () => {
      const reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      reminder.complete();

      expect(reminder.status).toBe('done');
      expect(reminder.version).toBe(4);
    });

    it('refuses a done reminder with REMINDER_ALREADY_DONE', () => {
      const reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.DONE,
        version: 4,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(() => reminder.complete()).toThrow(
        expect.objectContaining({
          code: 'REMINDER_ALREADY_DONE',
          message: 'Reminder 7 is already done',
        }) as Error,
      );
      expect(reminder.version).toBe(4);
    });
  });

  describe('reschedule', () => {
    let reminder: ReminderModel;

    beforeEach(() => {
      reminder = ReminderModel.reconstitute({
        id: '7',
        ownerId: 'owner-1',
        title: 'Call the bank',
        body: '',
        dueOn: '2026-11-05',
        status: ReminderStatusEnum.PENDING,
        version: 3,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      });
    });

    it('moves the due date and bumps the version', () => {
      reminder.reschedule('2026-11-12');

      expect(reminder.dueOn).toBe('2026-11-12');
      expect(reminder.version).toBe(4);
    });

    it('changes nothing for the current due date', () => {
      reminder.reschedule('2026-11-05');

      expect(reminder.dueOn).toBe('2026-11-05');
      expect(reminder.version).toBe(3);
    });

    it('refuses a date that does not exist and keeps the current one', () => {
      expect(() => reminder.reschedule('2026-02-30')).toThrow(
        expect.objectContaining({ code: 'REMINDER_DUE_ON_INVALID' }) as Error,
      );
      expect(reminder.dueOn).toBe('2026-11-05');
      expect(reminder.version).toBe(3);
    });

    it('refuses a done reminder with REMINDER_ALREADY_DONE', () => {
      reminder.complete();

      expect(() => reminder.reschedule('2026-11-12')).toThrow(
        expect.objectContaining({ code: 'REMINDER_ALREADY_DONE' }) as Error,
      );
      expect(reminder.dueOn).toBe('2026-11-05');
    });
  });
});
