#!/bin/bash
set -euo pipefail

# Builds the Payload admin locally, then deploys the standalone bundle to the
# selected server and reloads pm2.
#
# Usage:
#   sh scripts/deploy-standalone.sh [server]     # e.g. sh scripts/deploy-standalone.sh PersonalVPS
#
# The server is an ssh alias. Defaults to PersonalVPS (interactive picker when
# stdin is a terminal and no arg was given).

REMOTE_DIR="/var/www/portfolio-admin"
PM2_APP="multi-tenant-portfolio"
REMOTE_PORT="3001"
# Node 24 is REQUIRED on the server (global File API, --env-file). Must match
# the `interpreter` pinned in ecosystem.config.cjs.
NODE24="/root/.nvm/versions/node/v24.13.1/bin"
LOCAL_DIR="$(dirname "$0")/.."

HOST="${1:-}"
if [ -z "$HOST" ] && [ -t 0 ]; then
  echo "Choose a deploy target:"
  echo "  1) PersonalVPS"
  printf "  [1, default 1]: "
  read -r choice
  HOST="PersonalVPS"
fi
HOST="${HOST:-PersonalVPS}"
echo "Deploy target: $HOST"

cd "$LOCAL_DIR"

echo "=== 1/7 Building Next.js standalone (uses local .env) ==="
pnpm install --frozen-lockfile
pnpm run build

STANDALONE=".next/standalone"

echo ""
echo "=== 2/7 Preparing standalone folder ==="
[ -d public ] && cp -r public "$STANDALONE/"
[ -d .next/static ] && cp -r .next/static "$STANDALONE/.next/"

echo ""
echo "=== 3/7 Syncing to server ==="
rsync -avz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache' \
  --exclude='.env' \
  -e ssh \
  "$STANDALONE/" \
  "$HOST:$REMOTE_DIR/.next/standalone/"

echo ""
echo "=== 4/7 Rebuilding sharp for Node 24 on server ==="
# sharp's native binding is ABI-tied: a binary built for Node 18 segfaults
# silently seconds after boot under Node 24. Always rebuild on the target.
ssh "$HOST" "export PATH=$NODE24:\$PATH && cd $REMOTE_DIR && (npm rebuild sharp || pnpm rebuild sharp)"

echo ""
echo "=== 5/7 Syncing ecosystem.config.cjs ==="
rsync -avz ecosystem.config.cjs "$HOST:$REMOTE_DIR/ecosystem.config.cjs"

echo ""
echo "=== 6/7 Reloading PM2 ==="
ssh "$HOST" "cd $REMOTE_DIR && (pm2 reload ecosystem.config.cjs --only $PM2_APP --update-env || pm2 start ecosystem.config.cjs --only $PM2_APP) && pm2 save"

echo ""
echo "=== 7/7 Verifying ==="
ssh "$HOST" "sleep 8; curl -s -o /dev/null -w 'admin api:%{http_code}\n' --max-time 25 'http://localhost:$REMOTE_PORT/admin/api/tenants?limit=1'"

echo ""
echo "Done. Deployed admin standalone build to $HOST:$REMOTE_DIR"
