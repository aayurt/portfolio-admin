#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting Deployment for aayushshrestha.com..."

# 1. Pull the latest changes from GitHub
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Install dependencies (Clean install is safer for production)
echo "📦 Installing dependencies..."
pnpm install

# 3. Build the Next.js app
echo "🏗️ Building Next.js application..."
pnpm run build

# 4. Prepare the Standalone folder
# We must manually copy public and static folders as Next.js standalone doesn't do this
echo "📂 Assembling Standalone folder..."
if [ -d "public" ]; then
    cp -r public .next/standalone/
    echo "✅ Copied public/ to standalone"
fi

if [ -d ".next/static" ]; then
    cp -r .next/static .next/standalone/.next/
    echo "✅ Copied .next/static to standalone"
fi

# 5. Reload the app with PM2
# Using 'reload' instead of 'restart' ensures zero-downtime if you use cluster mode
echo "🔄 Reloading PM2 process..."
if pm2 list | grep -q "multi-porfolio-app"; then
    pm2 reload ecosystem.config.cjs --update-env
else
    pm2 start ecosystem.config.cjs
fi

# 6. Finalize
pm2 save
echo "✨ Deployment Complete! Your changes are live."
