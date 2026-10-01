#!/usr/bin/env bash
set -euo pipefail

echo "🚀 Deploying Portfolio Admin (slug aayurt) → PersonalVPS"

# ---------- 1. Local build ----------
echo "📦 Installing dependencies (frozen lockfile)..."
pnpm install --frozen-lockfile

echo "🏗️ Building Next.js application..."
pnpm run build

# Assemble standalone folder (public + .next/static)
echo "📂 Preparing standalone output..."
if [ -d "public" ]; then
    cp -r public .next/standalone/
    echo "✅ Copied public/ → standalone"
fi
if [ -d ".next/static" ]; then
    cp -r .next/static .next/standalone/.next/
    echo "✅ Copied .next/static → standalone"
fi

# Ensure slug aayurt (preserve other env vars)
echo "🔧 Setting NEXT_PUBLIC_SLUG=aayurt"
cat > .env.production <<EOF
NEXT_PUBLIC_SLUG=aayurt
EOF
if [ -f .env ]; then
    grep -v '^NEXT_PUBLIC_SLUG=' .env >> .env.production || true
fi
mv .env.production .env

echo "🏗️ Rebuilding with slug aayurt..."
pnpm run build
# Re‑assemble after second build
if [ -d "public" ]; then
    cp -r public .next/standalone/
fi
if [ -d ".next/static" ]; then
    cp -r .next/static .next/standalone/.next/
fi

# ---------- 2. Sync to PersonalVPS ----------
# NOTE: canonical deploy is `sh scripts/deploy-standalone.sh PersonalVPS`
# (see DEPLOY.md). This wrapper is kept for convenience and must use the
# `PersonalVPS` ssh alias — never a hardcoded IP.
VPS_HOST="PersonalVPS"               # ssh alias in ~/.ssh/config
VPS_PATH="/var/www/portfolio-admin/" # folder that holds the admin on the VPS

echo "📡 Syncing build to $VPS_HOST:$VPS_PATH ..."
rsync -avz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='.next/cache' \
    --exclude='.env' \
    . "$VPS_HOST:$VPS_PATH"

# ---------- 3. VPS post‑sync ----------
echo "🔧 Ensuring Node.js/npm are installed on VPS..."
ssh "$VPS_HOST" '
    if ! command -v node >/dev/null 2>&1; then
        echo "Installing Node.js (via apt)..."
        apt-get update && apt-get install -y nodejs npm
    fi
    # Ensure pm2 is installed globally
    if ! command -v pm2 >/dev/null 2>&1; then
        echo "Installing pm2 globally..."
        npm install -g pm2
    fi
'

echo "🔧 Rebuilding sharp binary on VPS..."
ssh "$VPS_HOST" "
    cd '$VPS_PATH' &&
    pnpm rebuild sharp || npm rebuild sharp
"

echo "🔄 Reloading (or starting) PM2 app..."
ssh "$VPS_HOST" "
    cd '$VPS_PATH' &&
    pm2 reload ecosystem.config.cjs --update-env ||
    pm2 start ecosystem.config.cjs
"

echo "💾 Saving PM2 process list..."
ssh "$VPS_HOST" "pm2 save"

echo "✨ Deployment completed for slug aayurt on PersonalVPS"