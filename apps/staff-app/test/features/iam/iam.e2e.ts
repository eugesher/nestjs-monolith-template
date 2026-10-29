import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../context/app-e2e.context';

export class IamE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): IamE2E {
    return new IamE2E(ctx);
  }

  public handleListRoles(): void {
    describe('GET /api/iam/roles', () => {
      it('should list the roles with their permissions from the database', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/iam/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without iam:assign', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/iam/roles')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleRegisterUser(): void {
    describe('POST /api/iam/users', () => {
      it('should create a user who can log in at once', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/iam/users')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({
            email: 'new-viewer@example.com',
            password: 'new-viewer-password-please-change',
            roles: ['viewer'],
          })
          .expect(HttpStatus.CREATED);

        const login = await request(this.ctx.app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'new-viewer@example.com', password: 'new-viewer-password-please-change' })
          .expect(HttpStatus.OK);

        const actual = {
          response: { body: response.body },
          db: {
            user: await this.ctx.dataSource.query(
              'SELECT * FROM `user` WHERE email = ? ORDER BY id',
              ['new-viewer@example.com'],
            ),
            user_roles: await this.ctx.dataSource.query(
              'SELECT * FROM user_roles WHERE user_id = ? ORDER BY role_id',
              [response.body.id],
            ),
          },
        };

        expect(actual).toMatchSnapshot({
          response: { body: { id: expect.any(String) } },
          db: {
            user: [
              {
                id: expect.any(String),
                password_hash: expect.any(String),
                created_at: expect.any(Date),
              },
            ],
            user_roles: [{ user_id: expect.any(String) }],
          },
        });
        expect(actual).toMatchObject({
          db: {
            user: [{ id: response.body.id }],
            user_roles: [{ user_id: response.body.id }],
          },
        });
        expect(response.body.id).toMatch(
          /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
        );
        expect(actual.db.user[0].password_hash).toMatch(/^\$argon2id\$v=19\$m=19456,p=1,t=2\$/);
        expect(login.body).toEqual({ accessToken: expect.any(String) });
      });

      it('should refuse a taken email in another case with 409', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/iam/users')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({
            email: 'EDITOR@example.com',
            password: 'another-password-please-change',
            roles: ['viewer'],
          })
          .expect(HttpStatus.CONFLICT);

        expect({
          response: { body: response.body },
          db: {
            user: await this.ctx.dataSource.query(
              'SELECT id, email FROM `user` WHERE email = ? ORDER BY id',
              ['editor@example.com'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }

  public handleAssignRole(): void {
    describe('POST /api/iam/users/:userId/roles', () => {
      it('should grant a role and answer 200', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/iam/users/00000000-0000-4000-8000-000000000004/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ role: 'editor' })
          .expect(HttpStatus.OK);

        expect({
          response: { body: response.body },
          db: {
            user_roles: await this.ctx.dataSource.query(
              'SELECT * FROM user_roles WHERE user_id = ? ORDER BY role_id',
              ['00000000-0000-4000-8000-000000000004'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should answer 404 for an unknown user', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .post('/api/iam/users/00000000-0000-4000-8000-000000000099/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ role: 'editor' })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleUpdateRolePermissions(): void {
    describe('PUT /api/iam/roles/:role/permissions', () => {
      it('should replace the permissions and refuse the same token at once', async () => {
        try {
          const before = await request(this.ctx.app.getHttpServer())
            .get('/api/ledger')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

          const response = await request(this.ctx.app.getHttpServer())
            .put('/api/iam/roles/viewer/permissions')
            .auth(this.ctx.adminToken, { type: 'bearer' })
            .send({ permissionCodes: ['item:read', 'reminder:read', 'reminder:write'] })
            .expect(HttpStatus.OK);

          const ledger = await request(this.ctx.app.getHttpServer())
            .get('/api/ledger')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.FORBIDDEN);

          expect({
            before: { status: before.status },
            response: { body: response.body },
            ledger: ledger.body,
            db: {
              role_permissions: await this.ctx.dataSource.query(
                'SELECT * FROM role_permissions WHERE role_id = 3 ORDER BY permission_id',
              ),
            },
          }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query(
            'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (3, 4)',
          );
        }
      });

      it('should refuse an unknown permission code with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/iam/roles/viewer/permissions')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ permissionCodes: ['item:read', 'item:delete'] })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            role_permissions: await this.ctx.dataSource.query(
              'SELECT * FROM role_permissions WHERE role_id = 3 ORDER BY permission_id',
            ),
          },
        }).toMatchSnapshot();
      });

      it('should answer 404 for an unknown role', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/iam/roles/auditor/permissions')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ permissionCodes: ['item:read'] })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
