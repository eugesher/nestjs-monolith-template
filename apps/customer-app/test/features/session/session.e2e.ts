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
      it('should issue an access token the guards accept and a refresh token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'editor@example.com', password: 'editor-password-please-change' })
          .expect(HttpStatus.OK);

        const me = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(response.body.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body }, me: me.body }).toMatchSnapshot({
          response: { body: { accessToken: expect.any(String), refreshToken: expect.any(String) } },
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

  public handleRefresh(): void {
    describe('POST /api/auth/refresh', () => {
      it('should exchange a refresh token for a pair the guards accept', async () => {
        const login = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'viewer@example.com', password: 'viewer-password-please-change' })
          .expect(HttpStatus.OK);

        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/refresh')
          .send({ refreshToken: login.body.refreshToken })
          .expect(HttpStatus.OK);

        const me = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(response.body.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body }, me: me.body }).toMatchSnapshot({
          response: { body: { accessToken: expect.any(String), refreshToken: expect.any(String) } },
        });
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
