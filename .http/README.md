# HTTP requests

Two [Posting](https://posting.sh) collections for checking the apps by hand, one per app:

```bash
posting --collection .http/staff-app --env .http/dev.env
```

```bash
posting --collection .http/customer-app --env .http/dev.env
```

Script paths in the requests are relative to the collection root, so the root must be
`.http/staff-app` or `.http/customer-app` itself.

## What is inside

One request per e2e case of the app. The folder is the endpoint, the number in the file name is
the order of the case in the e2e. The first line of a description is the full name of the e2e
test, so the test can be found in `apps/<app>/test`.

`app` holds the cases that check a route of the other app is not mounted.

Six e2e cases are not one request:

- the schema check of staff-app compares the migrated database with the entities and has no
  request;
- the concurrent renames of an item send six requests at once, `item/rename/05-concurrent` sends
  one;
- the replay of an item create sends the same request twice, as `item/create/02-replay` says;
- two simultaneous registrations with one email send the same request twice at once, in
  `customer-app/session/register/03-simultaneous` and `staff-app/iam/register-user/02-simultaneous`;
- the sign-up of a customer goes on to log in, read `me` and create an item with the new
  credentials, as `session/register/01-register` says.

## Environment

The requests expect both apps running against the e2e infrastructure with fresh seeds:

```bash
yarn test:e2e:infra:reload
```

Start each app with the database and Redis of the e2e infrastructure. The variables of the shell
take precedence over `env/apps/<app>/.env.local`:

```bash
DATABASE_URL=mysql://root:root@127.0.0.1:3307/acme_db REDIS_URL=redis://:e2e-redis-password@127.0.0.1:6380 yarn start:dev:staff-app
```

```bash
DATABASE_URL=mysql://root:root@127.0.0.1:3307/acme_db REDIS_URL=redis://:e2e-redis-password@127.0.0.1:6380 yarn start:dev:customer-app
```

The expected result in a description holds for fresh seeds and the first run. Write requests change
the fixtures, and a second run gets another answer: for example, a second create of the same user
hits the taken email. Run `yarn test:e2e:infra:reseed` to start over.

The e2e flushes Redis before every reminder case. When a description checks cache keys, run
`FLUSHDB` first.

## Tokens

Every request with authorization calls a function of `<collection>/scripts.py` in `setup`
(`as_admin`, `as_editor` and `as_viewer` for staff, `as_ann`, `as_bob` and `as_carol` for customers,
and so on). The function signs an HS256 token of a seeded user (`sub`, `iat`) with `JWT_SECRET` from
`env/apps/<app>/.env.local` and puts it into the variable `token`, as `ctx.jwt.sign` does in the e2e.
This also covers tokens that no login issues:

- the token of a disabled user (`as_disabled`, `as_dora`);
- a token with forged role claims (`as_viewer_forged_claims`);
- the token of a user of the other app (`as_customer`, `as_staff_user`);
- a token signed with the `JWT_SECRET` of the other app (`as_editor_with_customer_secret`,
  `as_ann_with_staff_secret`), which needs `.env.local` of both apps.

`session/login/01-editor` of staff-app and `session/login/01-customer` of customer-app save the token
they get into the variable `access_token`. The requests that send it say so in `Note:` or `User:`.

## Setup and cleanup

The lines `Before:` and `After:` of a description are the steps the e2e takes around the request:

- `SQL:` is a query to the e2e database (port 3307);
- `Redis:` is a command to the e2e Redis (port 6380, password `e2e-redis-password`);
- `send` names another request to send first.
