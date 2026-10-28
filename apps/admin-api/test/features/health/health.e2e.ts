import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class HealthE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): HealthE2E {
    return new HealthE2E(ctx);
  }

  public live(): void {
    describe('GET /api/health', () => {
      it('should report liveness and mint a correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: { body: { uptimeSeconds: expect.any(Number) } },
        });
        expect(response.headers['x-correlation-id']).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
      });

      it('should echo an inbound correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health')
          .set('x-correlation-id', 'e2e-correlation-id')
          .expect(HttpStatus.OK);

        expect(response.headers['x-correlation-id']).toEqual('e2e-correlation-id');
      });
    });
  }

  public ready(): void {
    describe('GET /api/health/ready', () => {
      it('should report readiness of the database and the cache', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/health/ready')
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot({
          response: {
            body: {
              dependencies: {
                database: { latencyMs: expect.any(Number) },
                cache: { latencyMs: expect.any(Number) },
              },
            },
          },
        });
      });
    });
  }
}
