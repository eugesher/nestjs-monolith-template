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

      it('should refuse an access token as a refresh token', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/refresh')
          .send({ refreshToken: this.ctx.viewerToken })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleMe(): void {
    describe('GET /api/auth/me', () => {
      it('should take the roles from the database, not from the token claims', async () => {
        const forged = this.ctx.jwt.sign({
          sub: '00000000-0000-4000-8000-000000000003',
          roles: ['admin'],
          permissions: ['iam:assign'],
        });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(forged, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const roles = await request(this.ctx.app.getHttpServer())
          .get('/api/iam/roles')
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

      it('should refuse a refresh token as an access token', async () => {
        const login = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'viewer@example.com', password: 'viewer-password-please-change' })
          .expect(HttpStatus.OK);

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(login.body.refreshToken, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the token of a disabled user', async () => {
        const token = this.ctx.jwt.sign({ sub: '00000000-0000-4000-8000-000000000004' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
