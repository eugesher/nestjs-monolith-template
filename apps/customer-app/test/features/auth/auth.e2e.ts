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
      it('should create a customer who logs in and enqueue the ledger record of the registration with the email under the correlation id', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/register')
          .set('x-correlation-id', 'e2e00000-0000-4000-8000-000000000002')
          .send({ email: 'Eve@Example.com', password: 'eve-password-please-change' })
          .expect(HttpStatus.CREATED);

        const login = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'eve@example.com', password: 'eve-password-please-change' })
          .expect(HttpStatus.OK);

        const me = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(login.body.accessToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        const records = await this.ctx.takeLedgerRecords();

        const actual = {
          response: { body: response.body },
          me: me.body,
          db: {
            customer: await this.ctx.dataSource.query(
              'SELECT * FROM customer WHERE email = ? ORDER BY id',
              ['eve@example.com'],
            ),
            ledger_entry: await this.ctx.dataSource.query(
              'SELECT * FROM ledger_entry WHERE subject_type = ? AND subject_id = ? ORDER BY id',
              ['customer', response.body.id],
            ),
          },
          ledger_record_queue: records.filter((record) => record.subjectId === response.body.id),
        };

        expect(actual).toMatchSnapshot({
          response: { body: { id: expect.any(String) } },
          me: { id: expect.any(String) },
          db: {
            customer: [
              {
                id: expect.any(String),
                password_hash: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
          },
          ledger_record_queue: [
            {
              operationKey: expect.any(String),
              subjectId: expect.any(String),
              occurredAt: expect.any(String),
            },
          ],
        });
        expect(actual).toMatchObject({
          me: { id: response.body.id },
          db: {
            customer: [{ id: response.body.id }],
          },
          ledger_record_queue: [
            {
              operationKey: `customer-registered:${response.body.id}`,
              subjectId: response.body.id,
            },
          ],
        });
        expect(response.body.id).toMatch(/^\d+$/);
        expect(actual.db.customer[0].password_hash).toMatch(/^\$argon2id\$v=19\$m=19456,t=2,p=1\$/);
      });

      it('should refuse a taken email in another case with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/register')
          .send({ email: 'ANN@example.com', password: 'another-password-please-change' })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            customer: await this.ctx.dataSource.query(
              'SELECT id, email FROM customer WHERE email = ? ORDER BY id',
              ['ann@example.com'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should let one of two simultaneous sign-ups with one email through and refuse the other with 409', async () => {
        const responses = await Promise.all([
          request(this.ctx.app.getHttpServer())
            .post('/api/auth/register')
            .send({ email: 'gina@example.com', password: 'gina-password-please-change' }),
          request(this.ctx.app.getHttpServer())
            .post('/api/auth/register')
            .send({ email: 'gina@example.com', password: 'gina-password-please-change' }),
        ]);
        const statuses = responses.map((response) => response.status).sort();
        const refused = responses.find((response) => 'code' in response.body);

        expect({
          statuses,
          refused: { body: refused?.body },
          db: {
            customer: await this.ctx.dataSource.query(
              'SELECT email FROM customer WHERE email = ? ORDER BY id',
              ['gina@example.com'],
            ),
          },
        }).toMatchSnapshot();
      });

      it.each([
        ['a malformed email', { email: 'frank', password: 'frank-password-please-change' }],
        ['a password shorter than 12', { email: 'frank@example.com', password: 'short-pass1' }],
      ])('should refuse %s with 400 from validation and store nothing', async (_, body) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/register')
          .send(body)
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            customer: await this.ctx.dataSource.query(
              'SELECT id FROM customer WHERE email LIKE ? ORDER BY id',
              ['frank%'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleLogin(): void {
    describe('POST /api/auth/login', () => {
      it('should issue an access token of the subject alone, valid for the lifetime of this app', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'ann@example.com', password: 'ann-password-please-change' })
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
        ['a wrong password', { email: 'ann@example.com', password: 'wrong-password-123' }],
        [
          'an unknown email',
          { email: 'nobody@example.com', password: 'ann-password-please-change' },
        ],
        [
          'the credentials of a staff user',
          { email: 'editor@example.com', password: 'editor-password-please-change' },
        ],
      ])('should refuse %s with the same 401', async (_, body) => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send(body)
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a disabled customer with 403', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'dora@example.com', password: 'dora-password-please-change' })
          .expect(HttpStatus.FORBIDDEN);

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

      it('should refuse the token of a disabled customer', async () => {
        const token = this.ctx.jwt.sign({ sub: '104' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse the token of a staff user signed with the secret of this app', async () => {
        const token = this.ctx.jwt.sign({ sub: '1' });

        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/auth/me')
          .auth(token, { type: 'bearer' })
          .expect(HttpStatus.UNAUTHORIZED);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
