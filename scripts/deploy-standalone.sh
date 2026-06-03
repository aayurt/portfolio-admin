#!/bin/bash
set -e

HOST="PersonalVPS"
REMOTE_DIR="/var/www/portfolio-admin"
LOCAL_DIR="$(dirname "$0")/.."

echo "=== Step 1: Building Next.js standalone ==="
cd "$LOCAL_DIR"
NODE_OPTIONS=--no-deprecation npx next build

echo ""
echo "=== Step 2: Preparing standalone folder ==="
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
cp ecosystem.config.cjs .next/standalone/
cp package.json .next/standalone/

echo ""
echo "=== Step 3: Syncing to VPS ==="
rsync -avz --delete --progress \
  .next/standalone/ \
  "$HOST:$REMOTE_DIR/.next/standalone/"

echo ""
echo "=== Step 4: Rebuilding native modules (sharp) on VPS ==="
ssh "$HOST" "source ~/.nvm/nvm.sh && \
  SHARP_DIR=$REMOTE_DIR/.next/standalone/node_modules/.pnpm/sharp@0.32.6/node_modules/sharp && \
  if [ ! -f \"\$SHARP_DIR/build/Release/sharp-linux-x64.node\" ]; then \
    echo 'Sharp linux binary missing. Downloading and rebuilding...' && \
    apt-get install -y libvips-dev >/dev/null 2>&1 && \
    TMPDIR=\$(mktemp -d) && \
    cd \$TMPDIR && \
    npm pack sharp@0.32.6 >/dev/null 2>&1 && \
    tar -xzf sharp-0.32.6.tgz >/dev/null 2>&1 && \
    cd package && \
    npm install --ignore-scripts=false >/dev/null 2>&1 && \
    cp build/Release/sharp-linux-x64.node \$SHARP_DIR/build/Release/ && \
    rm -rf \$TMPDIR && \
    echo 'Sharp rebuilt successfully'; \
  else \
    echo 'Sharp linux binary already exists'; \
  fi"

echo ""
echo "=== Step 5: Copying ecosystem.config.cjs to remote root ==="
rsync -avz ecosystem.config.cjs "$HOST:$REMOTE_DIR/ecosystem.config.cjs"

echo ""
echo "=== Step 6: Restarting PM2 ==="
ssh "$HOST" "source ~/.nvm/nvm.sh && pm2 start $REMOTE_DIR/ecosystem.config.cjs --update-env && pm2 save"

echo ""
echo "Done. Deployed standalone build to $HOST:$REMOTE_DIR"
