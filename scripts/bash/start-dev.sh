#!/usr/bin/env bash
set -euo pipefail

pids=()

cleanup() {
  for pid in "${pids[@]:-}"; do
    kill -- "-${pid}" 2>/dev/null || true
  done
}
trap cleanup EXIT INT TERM

for app in staff-app customer-app; do
  setsid yarn "start:dev:${app}" &
  pids+=("$!")
done

wait -n
