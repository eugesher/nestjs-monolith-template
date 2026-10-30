import { AppE2EContext } from '../../context/app-e2e.context';

export class IdempotencyPurgeE2E {
  private constructor(private readonly ctx: AppE2EContext) {}

  public static of(ctx: AppE2EContext): IdempotencyPurgeE2E {
    return new IdempotencyPurgeE2E(ctx);
  }

  public handleTick(): void {
    describe('schedule idempotency-purge', () => {
      it('should purge the keys older than the TTL and keep the fresh ones', async () => {
        await this.ctx.dataSource.query(
          `INSERT INTO idempotency_key (idempotency_key, request_fingerprint, status, response_body, created_at)
           VALUES ('e2e-purge-expired', REPEAT('a', 64), 'completed', NULL, '2026-01-01 00:00:00'),
                  ('e2e-purge-fresh', REPEAT('b', 64), 'completed', NULL, CURRENT_TIMESTAMP)`,
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
    });
  }
}
