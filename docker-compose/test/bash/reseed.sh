#!/usr/bin/env bash
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="$(cd "$INFRA_DIR/../.." && pwd)"
PROJECT=acme-e2e
DATABASE_NAME=acme_db
REDIS_PASSWORD=e2e-redis-password

export DATABASE_URL="mysql://root:root@127.0.0.1:3307/$DATABASE_NAME"

echo "Recreating $DATABASE_NAME"
docker exec -e MYSQL_PWD=root "$PROJECT-mysql-1" mysql -uroot \
  -e "DROP DATABASE IF EXISTS $DATABASE_NAME; CREATE DATABASE $DATABASE_NAME;"

echo "Flushing Redis"
docker exec -e REDISCLI_AUTH="$REDIS_PASSWORD" "$PROJECT-redis-1" redis-cli FLUSHALL

cd "$ROOT_DIR"

echo "Migrating"
yarn migration:run

echo "Seeding"
yarn test:e2e:seed
