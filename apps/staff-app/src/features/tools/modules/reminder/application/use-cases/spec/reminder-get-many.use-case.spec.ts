import { ReminderStatusEnum } from '@acme-libs/kernel';
import { ReminderModel } from '../../../domain';
import { ReminderGetManyUseCase } from '../reminder-get-many.use-case';

describe('ReminderGetManyUseCase', () => {
  let list: jest.Mock;
  let useCase: ReminderGetManyUseCase;

  beforeEach(() => {
    list = jest.fn().mockResolvedValue({
      items: [
        ReminderModel.reconstitute({
          id: '7',
          ownerId: 'owner-1',
          title: 'Call the bank',
          body: '',
          dueOn: '2026-11-05',
          status: ReminderStatusEnum.PENDING,
          version: 1,
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-01T00:00:00.000Z'),
        }),
      ],
      total: 1,
      page: 1,
      size: 20,
    });
    useCase = new ReminderGetManyUseCase({ list });
  });

  describe('execute', () => {
    it('lists the reminders of the owner in the default window', async () => {
      const page = await useCase.execute({
        page: undefined,
        size: undefined,
        ownerId: 'owner-1',
        status: undefined,
      });

      expect(list).toHaveBeenCalledWith({
        page: 1,
        size: 20,
        ownerId: 'owner-1',
        status: undefined,
      });
      expect(page).toEqual({
        items: [
          {
            id: '7',
            ownerId: 'owner-1',
            title: 'Call the bank',
            body: '',
            dueOn: '2026-11-05',
            status: 'pending',
            version: 1,
            createdAt: '2026-01-01T00:00:00.000Z',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        size: 20,
      });
    });

    it('passes the status filter and caps the page size at 100', async () => {
      await useCase.execute({
        page: 2,
        size: 500,
        ownerId: 'owner-1',
        status: ReminderStatusEnum.DONE,
      });

      expect(list).toHaveBeenCalledWith({
        page: 2,
        size: 100,
        ownerId: 'owner-1',
        status: 'done',
      });
    });
  });
});
