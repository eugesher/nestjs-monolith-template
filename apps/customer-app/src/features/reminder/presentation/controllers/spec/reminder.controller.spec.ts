import { ReminderStatusEnum, RoleEnum } from '@acme-libs/kernel';
import {
  ReminderCompleteUseCase,
  ReminderCreateUseCase,
  ReminderDeleteUseCase,
  ReminderGetManyUseCase,
  ReminderGetSummaryUseCase,
  ReminderRescheduleUseCase,
} from '../../../application';
import { ReminderController } from '../reminder.controller';

describe('ReminderController', () => {
  let create: jest.Mock;
  let getMany: jest.Mock;
  let getSummary: jest.Mock;
  let complete: jest.Mock;
  let reschedule: jest.Mock;
  let remove: jest.Mock;
  let controller: ReminderController;

  beforeEach(() => {
    create = jest.fn();
    getMany = jest.fn();
    getSummary = jest.fn();
    complete = jest.fn();
    reschedule = jest.fn();
    remove = jest.fn();

    controller = new ReminderController(
      { execute: create } as unknown as ReminderCreateUseCase,
      { execute: getMany } as unknown as ReminderGetManyUseCase,
      { execute: getSummary } as unknown as ReminderGetSummaryUseCase,
      { execute: complete } as unknown as ReminderCompleteUseCase,
      { execute: reschedule } as unknown as ReminderRescheduleUseCase,
      { execute: remove } as unknown as ReminderDeleteUseCase,
    );
  });

  describe('handleCreate', () => {
    it('creates the reminder of the body for the caller', async () => {
      create.mockResolvedValue({ id: '31', title: 'Renew' });

      const response = await controller.handleCreate(
        { title: 'Renew', body: 'The annual one', dueOn: '2026-06-01' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.VIEWER] },
      );

      expect(response).toEqual({ id: '31', title: 'Renew' });
      expect(create).toHaveBeenCalledWith({
        ownerId: 'user-1',
        title: 'Renew',
        body: 'The annual one',
        dueOn: '2026-06-01',
      });
    });
  });

  describe('handleGetMany', () => {
    it('lists only the reminders of the caller, even for an admin', async () => {
      getMany.mockResolvedValue({ items: [], total: 0, page: 2, size: 5 });

      const response = await controller.handleGetMany(
        { page: 2, size: 5, status: ReminderStatusEnum.DONE },
        {
          id: 'user-1',
          email: 'ann@example.com',
          roles: [RoleEnum.ADMIN],
        },
      );

      expect(response).toEqual({ items: [], total: 0, page: 2, size: 5 });
      expect(getMany).toHaveBeenCalledWith({
        page: 2,
        size: 5,
        ownerId: 'user-1',
        status: 'done',
      });
    });
  });

  describe('handleGetSummary', () => {
    it('reads the summary of the caller', async () => {
      getSummary.mockResolvedValue({ pending: 2, nextDueOn: '2026-06-01' });

      const response = await controller.handleGetSummary({
        id: 'user-1',
        email: 'ann@example.com',
        roles: [RoleEnum.VIEWER],
      });

      expect(response).toEqual({ pending: 2, nextDueOn: '2026-06-01' });
      expect(getSummary).toHaveBeenCalledWith({ ownerId: 'user-1' });
    });
  });

  describe('handleComplete', () => {
    it('completes the reminder of the path as the caller', async () => {
      complete.mockResolvedValue({ id: '31', status: 'done' });

      const response = await controller.handleComplete(
        { reminderId: '31' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.VIEWER] },
      );

      expect(response).toEqual({ id: '31', status: 'done' });
      expect(complete).toHaveBeenCalledWith({ reminderId: '31', ownerId: 'user-1' });
    });
  });

  describe('handleReschedule', () => {
    it('moves the reminder of the path to the date of the body as the caller', async () => {
      reschedule.mockResolvedValue({ id: '31', dueOn: '2026-07-01' });

      const response = await controller.handleReschedule(
        { reminderId: '31' },
        { dueOn: '2026-07-01' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.VIEWER] },
      );

      expect(response).toEqual({ id: '31', dueOn: '2026-07-01' });
      expect(reschedule).toHaveBeenCalledWith({
        reminderId: '31',
        ownerId: 'user-1',
        dueOn: '2026-07-01',
      });
    });
  });

  describe('handleDelete', () => {
    it('deletes the reminder of the path as the caller', async () => {
      remove.mockResolvedValue(undefined);

      const response = await controller.handleDelete(
        { reminderId: '31' },
        { id: 'user-1', email: 'ann@example.com', roles: [RoleEnum.VIEWER] },
      );

      expect(response).toBeUndefined();
      expect(remove).toHaveBeenCalledWith({ reminderId: '31', ownerId: 'user-1' });
    });
  });
});
