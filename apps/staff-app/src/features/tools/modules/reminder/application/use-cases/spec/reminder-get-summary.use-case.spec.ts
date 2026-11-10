import { ReminderGetSummaryUseCase } from '../reminder-get-summary.use-case';

describe('ReminderGetSummaryUseCase', () => {
  let summarize: jest.Mock;
  let read: jest.Mock;
  let useCase: ReminderGetSummaryUseCase;

  beforeEach(() => {
    summarize = jest.fn().mockResolvedValue({ pending: '2', nextDueOn: '2026-11-05' });
    read = jest.fn().mockResolvedValue({ pending: 3, nextDueOn: '2026-11-01' });
    useCase = new ReminderGetSummaryUseCase({ summarize }, { read, invalidate: jest.fn() }, 60_000);
  });

  describe('execute', () => {
    it('answers the summary the port read for the owner', async () => {
      const summary = await useCase.execute({ ownerId: 'owner-1' });
      const [query] = read.mock.calls[0] as [{ ownerId: string; ttlMs: number; compute: unknown }];

      expect(read).toHaveBeenCalledTimes(1);
      expect(query.ownerId).toBe('owner-1');
      expect(query.ttlMs).toBe(60_000);
      expect(query.compute).toBeInstanceOf(Function);
      expect(summary).toEqual({ pending: 3, nextDueOn: '2026-11-01' });
      expect(summarize).not.toHaveBeenCalled();
    });

    it('hands the port a computation that summarizes the reminders of the owner', async () => {
      await useCase.execute({ ownerId: 'owner-1' });

      const [query] = read.mock.calls[0] as [{ compute: () => Promise<unknown> }];
      const computed = await query.compute();

      expect(summarize).toHaveBeenCalledWith('owner-1');
      expect(computed).toEqual({ pending: 2, nextDueOn: '2026-11-05' });
    });

    it('computes no pending reminders when the owner has no summary row', async () => {
      summarize.mockResolvedValue(undefined);

      await useCase.execute({ ownerId: 'owner-1' });

      const [query] = read.mock.calls[0] as [{ compute: () => Promise<unknown> }];
      const computed = await query.compute();

      expect(computed).toEqual({ pending: 0, nextDueOn: null });
    });

    it('answers no next due date when nothing is pending', async () => {
      read.mockResolvedValue({ pending: 0, nextDueOn: null });

      const summary = await useCase.execute({ ownerId: 'owner-1' });

      expect(summary).toEqual({ pending: 0, nextDueOn: null });
    });
  });
});
