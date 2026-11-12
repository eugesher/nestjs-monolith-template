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
      it('should issue an access token of the subject alone, valid for the lifetime of this app', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'editor@example.com', password: 'editor-password-please-change' })
          .expect(HttpStatus.OK);

        const me = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(response.body.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const payload = this.ctx.jwt.verify<{ aud: string; iat: number; exp: number }>(
          response.body.accessToken,
        );
        const claims = Object.keys(payload).sort();
        const lifetime = payload.exp - payload.iat;

        expect({
          response: { body: response.body },
          me: me.body,
          claims,
          audience: payload.aud,
          lifetime,
        }).toMatchSnapshot({
          response: { body: { accessToken: expect.any(String) } },
        });
      });

      it.each([
        ['a wrong password', { email: 'editor@example.com', password: 'wrong-password-123' }],
        [
          'an unknown email',
          { email: 'nobody@example.com', password: 'editor-password-please-change' },
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
        const body = { email: 'nobody@example.com', password: 'editor-password-please-change' };

        for (let attempt = 0; attempt < limit; attempt++) {
          await request(this.ctx.app.getHttpServer())
            .post('/api/auth/login')
            .set('X-Forwarded-For', '203.0.113.10')
            .send(body);
        }

        const blocked = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .set('X-Forwarded-For', '203.0.113.10')
          .send(body)
          .expect(HttpStatus.TOO_MANY_REQUESTS);
        const other = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .set('X-Forwarded-For', '203.0.113.11')
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

  public handleMe(): void {
    describe('GET /api/auth/me', () => {
      it('should take the roles from the database, not from the token claims', async () => {
        const forged = this.ctx.jwt.sign({
          sub: '3',
          roles: ['admin'],
          permissions: ['access-management'],
        });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(forged, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const roles = await request(this.ctx.app.getHttpServer())
          .get('/api/access/roles')
          .auth(forged, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body }, roles: roles.body }).toMatchSnapshot();
      });

      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the token of a disabled user', async () => {
        const token = this.ctx.jwt.sign({ sub: '4' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the token of a customer signed with the secret of this app', async () => {
        const token = this.ctx.jwt.sign({ sub: '101' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the token of a staff user issued for the customer audience', async () => {
        const token = this.ctx.jwt.sign({ sub: '2' }, { audience: 'customer' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
