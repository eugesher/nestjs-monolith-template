# 036 — Production stack

The root `docker-compose.yml` is the production stack: MySQL, Redis, the migrations, the three apps,
Jaeger and an OpenTelemetry collector. `README.md` holds the commands and the values to set; the
infrastructure of a local run and of the e2e suites is in `013-e2e-infrastructure.md`.

| Service                                      | Published on                       |
| -------------------------------------------- | ---------------------------------- |
| `customer-app`, `staff-app`, `processor-app` | ports 3000, 3001, 3002             |
| `mysql`                                      | `127.0.0.1:3306`                   |
| `redis`                                      | `127.0.0.1:6379`                   |
| `jaeger`                                     | `127.0.0.1:16686`                  |
| `otel-collector`                             | `127.0.0.1:4317`, `127.0.0.1:4318` |

`yarn start:dev` listens on the ports of the apps too, so the stack and a local run do not start
together. The databases, Redis and the collector of the two never collide: `test/infra` publishes
them on other ports.

## Images

The app image is built from the root `Dockerfile` with the build argument `APP_NAME`: the same
recipe serves all three deployables. The builder installs every dependency, builds the app and then
keeps only the production dependencies with `yarn workspaces focus --all --production`. The runtime
stage copies `node_modules`, `nest-cli.json` and `dist/apps/<app>/` and runs as the `node` user with
`NODE_ENV=production`.

**The image checks liveness.** Its `HEALTHCHECK` runs `node` with the same `--env-file-if-exists` as
the app, because `PORT` and `API_PREFIX` come only from the mounted `.env`, and fetches
`/<prefix>/health` every 10 seconds after a start period of 30. Readiness stays out of it: a failed
database or Redis would mark every container unhealthy at once, and the apps recover on their own
when the dependency returns. Docker without Swarm only reports the state and restarts nothing; an
orchestrator such as Kubernetes ignores the instruction and probes `/health` and `/health/ready`
itself. Each check is a request and so a line of the request log.

The image has no dev dependencies and so no `pino-pretty`, which `LoggerSetupConfig` uses only with
`NODE_ENV=development`: a production process logs JSON.

The target `migrations` of the same `Dockerfile` holds `migrations/`, the production dependencies
and `scripts/node/admin-create.ts`. Its default command runs `migration:run` once. The apps depend
on it with `service_completed_successfully`, so no app starts over a schema that failed to migrate.

## Configuration

**The env files are mounted, never built in.** `.dockerignore` keeps every `.env` and `.env.test`
out of the build context. Compose mounts `env/apps/<app>/.env` into each app and
`env/migrations/.env` into the migrations, read-only, with the long form of a bind mount and
`create_host_path: false`: a missing file stops `up` with an error, where the short form would
create a directory in its place.

**The passwords of the infrastructure live in `env/compose/.env`.** Every `docker compose` command
of the stack takes it through `--env-file`, so `MYSQL_ROOT_PASSWORD`, `MYSQL_PASSWORD` and
`REDIS_SERVER_PASSWORD` stay out of the shell history. A value left empty stops compose through
`${VAR:?}`.

**`REDIS_SERVER_PASSWORD` is not `REDIS_PASSWORD`.** The server variable of compose has a name no
app reads, so a value exported for compose cannot override the setting of a process.

**MySQL and Redis are reachable by name.** The apps and the migrations connect to `mysql:3306` and
`redis:6379` on the `backend` network. The `127.0.0.1` ports are for an operator on the host. The
Redis healthcheck authenticates through `REDISCLI_AUTH`, the same variable the server takes its
password from, so the healthcheck command carries no password.

**TLS is on when a CA path is set.** `DATABASE_SSL_CA` and `REDIS_TLS_CA` hold the path of the
certificate authority file inside the container; empty, the clients connect without TLS, as on the
`backend` network of the stack. `TlsHelper` of `libs/config` reads the file for the four clients of
the libs: the ORM, Bull, the cache and the request limits. The migrations data source and
`admin-create.ts` read `DATABASE_SSL_CA` of `env/migrations/.env` themselves, since they import no
lib. A path that cannot be read stops the process at boot. The certificate of the server is always
verified against that authority.

**The apps need no DDL.** The stack runs the apps and the migrations as one MySQL user, `acme`, with
every privilege on the database. On a managed database the apps take a user with `SELECT`, `INSERT`,
`UPDATE` and `DELETE` only, and `env/migrations/.env` takes another one that may change the schema.

**The pools of all replicas share `max_connections`.** Each process opens up to `DATABASE_POOL_SIZE`
connections, 10 in the examples (see `034-orm-lib.md`), so the sum over every replica of the three
apps, plus the migrations and an operator, stays under the `max_connections` of the server, 151 by
default for MySQL.

**`HTTP_TRUST_PROXY_HOPS` is the number of proxies in front of an app.** The request limits count
per client address (see `003-authentication.md`), and Express takes that address from
`X-Forwarded-For` only for as many hops as it trusts. The stack publishes the apps directly, so the
examples set `0`; behind a load balancer or an ingress the value is the number of proxies on the
way, and a value too high lets a client choose its own address with the header.
`ThrottleSetupModule` sets `trust proxy` when the app starts, so `main.ts` and the e2e contexts need
no call of their own.

**`HTTP_CORS_ORIGINS` is empty in the examples.** No browser client of another origin calls the apps
until its origin is listed (see `037-http-edge.md`).

## First administrator

`scripts/node/admin-create.ts` runs once from the `migrations` image, after the migrations:

- it reads `ADMIN_EMAIL` and `ADMIN_PASSWORD`, of 12 characters or more, from `env/migrations/.env`;
- it creates the user and the `admin` role with the `access-management` permission only, so the
  first account can grant access and nothing else until it gives itself more;
- it writes in one transaction, so an email already taken fails without changes.

The two variables are removed from the file afterwards. The script hashes the password with
`AUTH_ARGON2_MEMORY_COST`, `AUTH_ARGON2_TIME_COST` and `AUTH_ARGON2_PARALLELISM` of the same file,
validated by the rules of the apps. The migrations image mounts no env file of an app, so these
values repeat those of `staff-app`; a hash made with lower costs would stay weaker than the others
until the administrator changes the password.

## Tracing

An app traces when its `.env` sets `OTEL_SDK_DISABLED=false`. The image starts Node with
`--env-file-if-exists`, so the tracer, the first import of `main.ts`, sees that value before Nest
loads the file (see `012-app-bootstrap.md`).

`OTEL_EXPORTER_OTLP_ENDPOINT` is a base address, `http://otel-collector:4318`: the SDK appends
`/v1/traces` itself, and a value with that path sends spans to `/v1/traces/v1/traces`.

The collector reads `otel-collector.config.yaml` and forwards the traces to Jaeger. That file has no
`debug` exporter, so spans stay out of the logs of the collector;
`test/infra/docker/otel-collector.config.yaml` has one for a local run.
