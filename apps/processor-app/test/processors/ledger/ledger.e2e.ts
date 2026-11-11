import type { AppE2EContext } from '../../context/app-e2e.context';

export class LedgerE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): LedgerE2E {
    return new LedgerE2E(ctx);
  }

  public handleRecord(): void {
    describe('queue ledger-record', () => {
      it('should append the record as a ledger entry under its correlation id', async () => {
        await this.ctx.ledgerRecordQueue.add({
          operationKey: 'e2e-record:1',
          subjectType: 'product',
          subjectId: '100',
          action: 'ProductCreated',
          payload: { sku: 'SKU-0001', name: 'Recorded product' },
          occurredAt: '2026-01-05T08:00:00.000Z',
          correlationId: 'e2e-processor-record',
        });

        await this.ctx.waitForLedgerRecordQueue();

        expect({
          db: {
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE operation_key = ? ORDER BY id',
              ['e2e-record:1'],
            ),
          },
        }).toMatchSnapshot({
          db: { ledger_entry: [{ id: expect.any(String), recorded_at: expect.any(Date) }] },
        });
      });

      it('should append a record replayed under the same operation key only once', async () => {
        const record = {
          operationKey: 'e2e-record:2',
          subjectType: 'product',
          subjectId: '101',
          action: 'ProductArchived',
          payload: { sku: 'SKU-0002', previousStatus: 'active' },
          occurredAt: '2026-01-05T09:00:00.000Z',
          correlationId: 'e2e-processor-replay',
        };

        await this.ctx.ledgerRecordQueue.add(record);
        await this.ctx.ledgerRecordQueue.add(record);
        await this.ctx.waitForLedgerRecordQueue();

        expect({
          db: {
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT operation_key, action FROM ledger_entry WHERE operation_key = ? ORDER BY id',
              ['e2e-record:2'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should keep a record that fails its last attempt among the failed jobs', async () => {
        const job = await this.ctx.ledgerRecordQueue.add(
          {
            operationKey: 'e2e-record:3',
            subjectType: 'p'.repeat(65),
            subjectId: '102',
            action: 'ProductCreated',
            payload: {},
            occurredAt: '2026-01-05T10:00:00.000Z',
            correlationId: 'e2e-processor-failure',
          },
          { attempts: 1 },
        );

        await this.ctx.waitFor('the record to fail', () => job.isFailed());

        expect({
          db: {
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE operation_key = ?',
              ['e2e-record:3'],
            ),
          },
          failed: (await this.ctx.ledgerRecordQueue.getFailed()).map((failed) => failed.data),
        }).toMatchSnapshot();

        await job.remove();
      });
    });
  }
}
