import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class SessionE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): SessionE2E {
    return new SessionE2E(ctx);
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

        const payload = this.ctx.jwt.verify<{ iat: number; exp: number }>(
          response.body.accessToken,
        );
        const claims = Object.keys(payload).sort();
        const lifetime = payload.exp - payload.iat;

        expect({
          response: { body: response.body },
          me: me.body,
          claims,
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
    });
  }

  public handleMe(): void {
    describe('GET /api/auth/me', () => {
      it('should refuse a caller without a token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
