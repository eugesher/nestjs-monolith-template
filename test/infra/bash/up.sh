#!/usr/bin/env bash
set -euo pipefail

INFRA_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$INFRA_DIR/docker/docker-compose.yml"

docker compose -f "$COMPOSE_FILE" up --renew-anon-volumes --detach

docker compose -f "$COMPOSE_FILE" logs --follow &
LOGS_PID=$!
trap 'kill "$LOGS_PID" 2>/dev/null || true' EXIT

docker compose -f "$COMPOSE_FILE" up --detach --wait
