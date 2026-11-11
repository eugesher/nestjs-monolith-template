import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import type { AppE2EContext } from '../../../context/app-e2e.context';

export class UserE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): UserE2E {
    return new UserE2E(ctx);
  }

  public handleRegister(): void {
    describe('POST /api/access/users', () => {
      it('should create a user who can log in at once', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/access/users')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({
            email: 'new-viewer@example.com',
            password: 'new-viewer-password-please-change',
            roleIds: ['3'],
          })
          .expect(HttpStatus.CREATED);

        const login = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'new-viewer@example.com', password: 'new-viewer-password-please-change' })
          .expect(HttpStatus.OK);

        const actual = {
          response: { body: response.body },
          db: {
            staff_user: await this.ctx.dataSource.query(
              'SELECT * FROM staff_user WHERE email = ? ORDER BY id',
              ['new-viewer@example.com'],
            ),
            staff_user_roles: await this.ctx.dataSource.query(
              'SELECT * FROM staff_user_roles WHERE user_id = ? ORDER BY role_id',
              [response.body.id],
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          response: { body: { id: expect.any(String) } },
          db: {
            staff_user: [
              {
                id: expect.any(String),
                password_hash: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            staff_user_roles: [{ user_id: expect.any(String) }],
          },
        });
        expect(actual).toMatchObject({
          db: {
            staff_user: [{ id: response.body.id }],
            staff_user_roles: [{ user_id: response.body.id }],
          },
        });
        expect(response.body.id).toMatch(/^\d+$/);
        expect(actual.db.staff_user[0].password_hash).toMatch(
          /^\$argon2id\$v=19\$m=19456,p=1,t=2\$/,
        );
        expect(login.body).toEqual({ accessToken: expect.any(String) });
      });

      it('should refuse a role that is not stored with 404 and create no user', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/access/users')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({
            email: 'unknown-role@example.com',
            password: 'unknown-role-password-please-change',
            roleIds: ['3', '99'],
          })
          .expect(HttpStatus.NOT_FOUND);

        const actual = {
          response: { body: response.body },
          db: {
            staff_user: await this.ctx.dataSource.query(
              'SELECT * FROM staff_user WHERE email = ? ORDER BY id',
              ['unknown-role@example.com'],
            ),
          },
        };

        expect(actual).toMatchSnapshot();
      });

      it('should let one of two simultaneous registrations with one email through and refuse the other with 409', async () => {
        const body = {
          email: 'race-viewer@example.com',
          password: 'race-viewer-password-please-change',
          roleIds: ['3'],
        };

        const responses = await Promise.all([
          request(this.ctx.app.getHttpServer())
            .post('/api/access/users')
            .auth(this.ctx.adminToken, { type: 'bearer' })
            .send(body),
          request(this.ctx.app.getHttpServer())
            .post('/api/access/users')
            .auth(this.ctx.adminToken, { type: 'bearer' })
            .send(body),
        ]);
        const statuses = responses.map((response) => response.status).sort();
        const refused = responses.find((response) => 'code' in response.body);

        expect({
          statuses,
          refused: { body: refused?.body },
          db: {
            staff_user: await this.ctx.dataSource.query(
              'SELECT email FROM staff_user WHERE email = ? ORDER BY id',
              ['race-viewer@example.com'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should refuse a taken email in another case with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/access/users')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({
            email: 'EDITOR@example.com',
            password: 'another-password-please-change',
            roleIds: ['3'],
          })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            staff_user: await this.ctx.dataSource.query(
              'SELECT id, email FROM staff_user WHERE email = ? ORDER BY id',
              ['editor@example.com'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleReassignRoles(): void {
    describe('PUT /api/access/users/:userId/roles', () => {
      const staffUserRolesOf = async (userId: string): Promise<unknown> =>
        await this.ctx.dataSource.query(
          'SELECT * FROM staff_user_roles WHERE user_id = ? ORDER BY role_id',
          [userId],
        );

      it('should clear the roles with an empty list and answer 200', async () => {
        try {
          const response = await request(this.ctx.app.getHttpServer())
            .put('/api/access/users/4/roles')
            .auth(this.ctx.adminToken, { type: 'bearer' })
            .send({ roleIds: [] })
            .expect(HttpStatus.OK);

          expect({
            response: { body: response.body },
            db: { staff_user_roles: await staffUserRolesOf('4') },
          }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            'INSERT INTO staff_user_roles (user_id, role_id) VALUES (4, 3)',
          );
        }
      });

      it('should reassign the roles and answer 200', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/access/users/4/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ roleIds: ['2', '3'] })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: { staff_user_roles: await staffUserRolesOf('4') },
        }).toMatchSnapshot();
      });

      it('should answer 404 for a role that is not stored and change nothing', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/access/users/4/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ roleIds: ['2', '99'] })
          .expect(HttpStatus.NOT_FOUND);

        expect({
          response: { body: response.body },
          db: { staff_user_roles: await staffUserRolesOf('4') },
        }).toMatchSnapshot();
      });

      it('should answer 404 for an unknown user', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/access/users/99/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ roleIds: ['2'] })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
