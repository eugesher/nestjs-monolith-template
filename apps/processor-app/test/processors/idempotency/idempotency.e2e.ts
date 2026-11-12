import type { AppE2EContext } from '../../context/app-e2e.context';

export class IdempotencyE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): IdempotencyE2E {
    return new IdempotencyE2E(ctx);
  }

  public handleTick(): void {
    describe('schedule idempotency-purge', () => {
      it('should purge the keys older than the TTL and keep the fresh ones', async () => {
        await this.ctx.dataSource.query(
          `INSERT INTO idempotency_key (scope, idempotency_key, request_fingerprint, status, response_body, created_at)
           VALUES ('customer:101', 'e2e-purge-expired', REPEAT('a', 64), 'completed', NULL, '2026-01-01 00:00:00'),
                  ('customer:101', 'e2e-purge-fresh', REPEAT('b', 64), 'completed', NULL, CURRENT_TIMESTAMP)`,
        );

        this.ctx.fireSchedule('idempotency-purge');

        await this.ctx.waitFor('the expired key to be purged', async () => {
          const [{ expired }] = await this.ctx.dataSource.query(
            'SELECT COUNT(*) AS expired FROM idempotency_key WHERE idempotency_key = ?',
            ['e2e-purge-expired'],
          );

          return Number(expired) === 0;
        });

        expect({
          db: {
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT idempotency_key, status FROM idempotency_key WHERE idempotency_key LIKE ? ORDER BY id',
              ['e2e-purge-%'],
            ),
          },
        }).toMatchSnapshot();
      });

      it('should purge the in-flight keys older than the in-flight TTL and keep the rest', async () => {
        await this.ctx.dataSource.query(
          `INSERT INTO idempotency_key (scope, idempotency_key, request_fingerprint, status, response_body, created_at)
           VALUES ('customer:101', 'e2e-stuck-in-flight', REPEAT('c', 64), 'in_flight', NULL, CURRENT_TIMESTAMP - INTERVAL 1 HOUR),
                  ('customer:101', 'e2e-stuck-completed', REPEAT('d', 64), 'completed', '{}', CURRENT_TIMESTAMP - INTERVAL 1 HOUR),
                  ('customer:101', 'e2e-stuck-fresh', REPEAT('e', 64), 'in_flight', NULL, CURRENT_TIMESTAMP)`,
        );

        this.ctx.fireSchedule('idempotency-purge');

        await this.ctx.waitFor('the stuck in-flight key to be purged', async () => {
          const [{ stuck }] = await this.ctx.dataSource.query(
            'SELECT COUNT(*) AS stuck FROM idempotency_key WHERE idempotency_key = ?',
            ['e2e-stuck-in-flight'],
          );

          return Number(stuck) === 0;
        });

        expect({
          db: {
            idempotency_key: await this.ctx.dataSource.query(
              'SELECT idempotency_key, status FROM idempotency_key WHERE idempotency_key LIKE ? ORDER BY id',
              ['e2e-stuck-%'],
            ),
          },
        }).toMatchSnapshot();
      });
    });
  }
}
