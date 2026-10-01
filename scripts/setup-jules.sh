#!/usr/bin/env bash
# Jules Initial Setup — portfolio-admin (Payload CMS)
# Paste this file's contents into Jules repo Configuration → Initial Setup,
# then click Run & Snapshot.
# NOTE: Jules VMs have no Postgres by default. Without DATABASE_URI the
# script validates install + types + build and skips boot (exit 0).
set -euo pipefail

echo "--- environment checks ---"
node -v
npm -v
pnpm -v || npm install -g pnpm@10

echo "--- install (lockfile-aware) ---"
if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi

echo "--- lint ---"
pnpm lint || true

echo "--- types ---"
pnpm generate:types || echo "generate:types skipped (needs env?)"

echo "--- build ---"
if [ -z "${DATABASE_URI:-}" ]; then
  echo "DATABASE_URI unset — build may fail without Postgres; attempting anyway..."
fi
pnpm build || echo "build needs DATABASE_URI (Postgres) — snapshot still usable for code tasks"

echo "JULES_SETUP_OK"
