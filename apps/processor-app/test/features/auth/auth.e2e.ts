import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';

import type { AppE2EContext } from '../../context/app-e2e.context';

export class AuthE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): AuthE2E {
    return new AuthE2E(ctx);
  }

  public handleLogin(): void {
    describe('POST /api/auth/login', () => {
      it('should issue an access token that opens the routes the user holds a permission for', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'admin@example.com', password: 'admin-password-please-change' })
          .expect(HttpStatus.OK);

        const queues = await request(this.ctx.app.getHttpServer())
          .get('/api/queues')
          .auth(response.body.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);
        const queueNames = (queues.body as { name: string }[]).map((queue) => queue.name);

        expect({
          response: { body: response.body },
          queues: queueNames,
        }).toMatchSnapshot({
          response: { body: { accessToken: expect.any(String) } },
        });
      });

      it.each([
        ['a wrong password', { email: 'admin@example.com', password: 'wrong-password-123' }],
        [
          'an unknown email',
          { email: 'nobody@example.com', password: 'admin-password-please-change' },
        ],
      ])('should refuse %s with the same 401', async (_, body) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send(body)
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a disabled user with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'disabled@example.com', password: 'disabled-password-please-change' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse an empty body with 400 from validation', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({})
          .expect(HttpStatus.BAD_REQUEST);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should answer 429 to an address that spends the auth limit and keep serving another address', async () => {
        const limit = this.ctx.moduleFixture
          .get(ConfigService)
          .getOrThrow<number>('THROTTLE_AUTH_LIMIT');
        const body = { email: 'nobody@example.com', password: 'admin-password-please-change' };

        for (let attempt = 0; attempt < limit; attempt++) {
          await request(this.ctx.app.getHttpServer())
            .post('/api/auth/login')
            .set('X-Forwarded-For', '203.0.113.30')
            .send(body);
        }

        const blocked = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .set('X-Forwarded-For', '203.0.113.30')
          .send(body)
          .expect(HttpStatus.TOO_MANY_REQUESTS);
        const other = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .set('X-Forwarded-For', '203.0.113.31')
          .send(body)
          .expect(HttpStatus.UNAUTHORIZED);

        expect({
          blocked: { body: blocked.body, retryAfter: blocked.headers['retry-after-auth'] },
          other: { body: other.body },
        }).toMatchSnapshot({ blocked: { retryAfter: expect.stringMatching(/^\d+$/) } });
        expect(Number(blocked.headers['retry-after-auth'])).toBeGreaterThan(0);
      });
    });
  }
}
