import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../context/app-e2e.context';

export class AuthE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): AuthE2E {
    return new AuthE2E(ctx);
  }

  public handleRegister(): void {
    describe('POST /api/auth/register', () => {
      it('should create a customer and append the ledger entry of the registration', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/register')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000023')
          .send({ email: 'Eve@Example.com', password: 'eve-password-please-change' })
          .expect(HttpStatus.CREATED);

        const actual = {
          response: { body: response.body },
          db: {
            customer: await this.ctx.dataSource.query('SELECT * FROM customer WHERE email = ?', [
              'eve@example.com',
            ]),
            ledger_entry: await this.ctx.pollUntil<Record<string, unknown>[]>(
              () =>
                this.ctx.dataSource.query('SELECT * FROM ledger_entry WHERE correlation_id = ?', [
                  'e2e00000-0000-4000-8000-000000000023',
                ]),
              (rows) => rows.length >= 1,
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          response: { body: { id: expect.any(String) } },
          db: {
            customer: [
              {
                id: expect.any(String),
                password_hash: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            ledger_entry: [
              {
                id: expect.any(String),
                operation_key: expect.any(String),
                subject_id: expect.any(String),
                occurred_at: expect.any(Date),
                recorded_at: expect.any(Date),
              },
            ],
          },
        });
        expect(actual).toMatchObject({
          db: {
            customer: [{ id: response.body.id }],
            ledger_entry: [
              {
                operation_key: `customer-registered:${response.body.id}`,
                subject_id: response.body.id,
              },
            ],
          },
        });
      });
    });
  }
}
