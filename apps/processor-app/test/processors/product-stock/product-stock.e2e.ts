import { AppE2EContext } from '../../context/app-e2e.context';

export class ProductStockE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ProductStockE2E {
    return new ProductStockE2E(ctx);
  }

  public handleRecord(): void {
    describe('queue product-stock-post-subtract', () => {
      it('should archive a published product without stock and record the archive in the ledger under the correlation id', async () => {
        await this.ctx.postSubtractQueue.add({
          productIds: ['106'],
          correlationId: 'e2e-processor-out-of-stock',
        });

        await this.ctx.waitForPostSubtractQueue();
        await this.ctx.waitForLedgerRecordQueue();

        expect({
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT id, status, version FROM product WHERE id = 106',
            ),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT operation_key, action, payload, correlation_id FROM ledger_entry WHERE subject_id = ? ORDER BY id',
              ['106'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should leave a published product with stock and a draft without stock as they are', async () => {
        await this.ctx.postSubtractQueue.add({
          productIds: ['100', '102'],
          correlationId: 'e2e-processor-in-stock',
        });

        await this.ctx.waitForPostSubtractQueue();
        await this.ctx.waitForLedgerRecordQueue();

        expect({
          db: {
            product: await this.ctx.dataSource.query(
              'SELECT id, status, version FROM product WHERE id IN (100, 102) ORDER BY id',
            ),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT operation_key FROM ledger_entry WHERE correlation_id = ?',
              ['e2e-processor-in-stock'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }
}
