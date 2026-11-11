import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../../context/app-e2e.context';

export class ProductStockE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): ProductStockE2E {
    return new ProductStockE2E(ctx);
  }

  public handleAdd(): void {
    describe('POST /api/warehouse/product-stock/:productId/add', () => {
      it('should add the units and append the ledger entry of the stock row', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/warehouse/product-stock/106/add')
          .set('Idempotency-Key', 'system-restock-key')
          .set('x-correlation-id', 'system-product-restock')
          .auth(this.ctx.editorToken, { type: 'bearer' })
          .send({ quantity: 5 })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            product_stock: await this.ctx.dataSource.query(
              'SELECT * FROM product_stock WHERE product_id = 106 ORDER BY id',
            ),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ?',
              ['system-restock-key'],
            ),
            ledger_entry: await this.ctx.pollUntil<Record<string, unknown>[]>(
              () =>
                this.ctx.dataSource.query('SELECT * FROM ledger_entry WHERE correlation_id = ?', [
                  'system-product-restock',
                ]),
              (rows) => rows.length >= 1,
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          db: {
            product_stock: [{}, {}, { id: expect.any(String), created_at: expect.any(Date) }],
            idempotency_key: [
              {
                id: expect.any(String),
                response_body: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            ledger_entry: [
              {
                id: expect.any(String),
                operation_key: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual.db.ledger_entry[0].operation_key).toBe(
          `product-restocked:${actual.db.product_stock[2].id}`,
        );
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });
    });
  }
}
