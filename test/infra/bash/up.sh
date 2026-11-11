#!/usr/bin/env bash
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$INFRA_DIR/docker/docker-compose.yml"

docker compose -f "$COMPOSE_FILE" up --renew-anon-volumes --detach

set -m
docker compose -f "$COMPOSE_FILE" logs --follow &
LOGS_PID=$!
set +m

stop_logs() {
  kill -TERM -- "-$LOGS_PID" 2>/dev/null || true
  wait "$LOGS_PID" 2>/dev/null || true
}

trap stop_logs EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

docker compose -f "$COMPOSE_FILE" up --detach --wait
