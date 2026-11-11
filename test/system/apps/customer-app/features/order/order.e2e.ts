import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../context/app-e2e.context';

export class OrderE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): OrderE2E {
    return new OrderE2E(ctx);
  }

  public handlePlace(): void {
    describe('POST /api/orders', () => {
      it('should place the order, append its ledger entry and archive the sold-out product with its own entry under the correlation id', async () => {
        await this.ctx.redis.set('acme:catalog:v1:page:1:limit:20', '{}');

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/orders')
          .set('Idempotency-Key', 'system-order-key')
          .set('x-correlation-id', 'system-order-place')
          .auth(this.ctx.annToken, { type: 'bearer' })
          .send({ productIds: ['103', '103', '103'] })
          .expect(HttpStatus.CREATED);

        const ledgerEntries = await this.ctx.pollUntil<Record<string, unknown>[]>(
          () =>
            this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE correlation_id = ? ORDER BY action',
              ['system-order-place'],
            ),
          (rows) => rows.length >= 2,
        );

        const actual = {
          response: { body: response.body },
          db: {
            order: await this.ctx.dataSource.query('SELECT * FROM `order` WHERE id = ?', [
              response.body.id,
            ]),
            order_product: await this.ctx.dataSource.query(
              'SELECT * FROM order_product WHERE order_id = ? ORDER BY id',
              [response.body.id],
            ),
            product_stock: await this.ctx.dataSource.query(
              'SELECT stock.* FROM product_stock stock JOIN order_product line ON line.id = stock.order_product_id WHERE line.order_id = ? ORDER BY stock.id',
              [response.body.id],
            ),
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT * FROM idempotency_key WHERE idempotency_key = ?',
              ['system-order-key'],
            ),
            product: await this.ctx.dataSource.query('SELECT * FROM product WHERE id = 103'),
            ledger_entry: ledgerEntries,
          },
          cache: { keys: await this.ctx.redis.keys('acme:catalog:*') },
        };

        expect(actual).toMatchSnapshot({
          response: {
            body: {
              id: expect.any(String),
              createdAt: expect.any(String),
              products: [
                { id: expect.any(String) },
                { id: expect.any(String) },
                { id: expect.any(String) },
              ],
            },
          },
          db: {
            order: [{ id: expect.any(String), created_at: expect.any(Date) }],
            order_product: [
              { id: expect.any(String), order_id: expect.any(String) },
              { id: expect.any(String), order_id: expect.any(String) },
              { id: expect.any(String), order_id: expect.any(String) },
            ],
            product_stock: [
              {
                id: expect.any(String),
                order_product_id: expect.any(String),
                created_at: expect.any(Date),
              },
              {
                id: expect.any(String),
                order_product_id: expect.any(String),
                created_at: expect.any(Date),
              },
              {
                id: expect.any(String),
                order_product_id: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            idempotency_key: [
              {
                id: expect.any(String),
                response_body: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            product: [{ updated_at: expect.any(Date) }],
            ledger_entry: [
              {
                id: expect.any(String),
                operation_key: expect.any(String),
                subject_id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
              {
                id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual).toMatchObject({
          db: {
            order: [{ id: response.body.id }],
            order_product: [
              { id: response.body.products[0].id, order_id: response.body.id },
              { id: response.body.products[1].id, order_id: response.body.id },
              { id: response.body.products[2].id, order_id: response.body.id },
            ],
            product_stock: [
              { order_product_id: response.body.products[0].id },
              { order_product_id: response.body.products[1].id },
              { order_product_id: response.body.products[2].id },
            ],
            ledger_entry: [
              { operation_key: `order-placed:${response.body.id}`, subject_id: response.body.id },
              {},
            ],
          },
        });
        expect(JSON.parse(actual.db.idempotency_key[0].response_body)).toEqual(response.body);
      });
    });
  }
}
