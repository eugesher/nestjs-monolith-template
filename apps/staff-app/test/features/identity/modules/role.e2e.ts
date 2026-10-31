import { HttpStatus } from '@nestjs/common';
import request from 'supertest';

import { AppE2EContext } from '../../../context/app-e2e.context';

export class RoleE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): RoleE2E {
    return new RoleE2E(ctx);
  }

  public handleList(): void {
    describe('GET /api/identity/roles', () => {
      it('should list the roles with their permissions from the database', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/identity/roles')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .expect(HttpStatus.OK);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });

      it('should refuse a caller without iam:assign', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .get('/api/identity/roles')
          .auth(this.ctx.viewerToken, { type: 'bearer' })
          .expect(HttpStatus.FORBIDDEN);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }

  public handleUpdatePermissions(): void {
    describe('PUT /api/identity/roles/:role/permissions', () => {
      it('should replace the permissions and refuse the same token at once', async () => {
        try {
          const before = await request(this.ctx.app.getHttpServer())
            .get('/api/ledger')
            .auth(this.ctx.viewerToken, { type: 'bearer' })
            .expect(HttpStatus.OK);

          const response = await request(this.ctx.app.getHttpServer())
            .put('/api/identity/roles/viewer/permissions')
            .auth(this.ctx.adminToken, { type: 'bearer' })
            .send({ permissionCodes: ['product:write'] })
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
              staff_role_permissions: await this.ctx.dataSource.query(
                'SELECT * FROM staff_role_permissions WHERE role_id = 3 ORDER BY permission_id',
              ),
            },
          }).toMatchSnapshot();
        } finally {
          await this.ctx.dataSource.query('DELETE FROM staff_role_permissions WHERE role_id = 3');
          await this.ctx.dataSource.query(
            'INSERT INTO staff_role_permissions (role_id, permission_id) VALUES (3, 1), (3, 7), (3, 10)',
          );
        }
      });

      it('should refuse an unknown permission code with 400', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/identity/roles/viewer/permissions')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ permissionCodes: ['ledger:read', 'ledger:delete'] })
          .expect(HttpStatus.BAD_REQUEST);

        expect({
          response: { body: response.body },
          db: {
            staff_role_permissions: await this.ctx.dataSource.query(
              'SELECT * FROM staff_role_permissions WHERE role_id = 3 ORDER BY permission_id',
            ),
          },
        }).toMatchSnapshot();
      });

      it('should answer 404 for an unknown role', async () => {
        const response = await request(this.ctx.app.getHttpServer())
          .put('/api/identity/roles/auditor/permissions')
          .auth(this.ctx.adminToken, { type: 'bearer' })
          .send({ permissionCodes: ['ledger:read'] })
          .expect(HttpStatus.NOT_FOUND);

        expect({ response: { body: response.body } }).toMatchSnapshot();
      });
    });
  }
}
