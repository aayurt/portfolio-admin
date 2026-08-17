#!/bin/bash
set -euo pipefail

# ── Configuration ──────────────────────────────────────────────────────────
HOST=""                                     # ssh alias; chosen below or passed as arg
REMOTE_DIR="/var/www/portfolio-admin"       # deploy root on the server
LOCAL_DIR="$(dirname "$0")/.."
# Extra native packages to bootstrap for linux-x64, space separated, e.g.
#   NATIVE_DEPS="bcrypt@5.1.1 canvas@2.11.2" ./scripts/deploy-standalone.sh
NATIVE_DEPS="${NATIVE_DEPS:-}"
# ───────────────────────────────────────────────────────────────────────────

LOCAL_ONLY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --local-only) LOCAL_ONLY=1 ;;
    --host) HOST="${2:-}"; shift ;;
    -h|--help) echo "Usage: $0 [--local-only] [--host <alias>]"; exit 0 ;;
    *) HOST="$1" ;;
  esac
  shift
done

# Interactive host selection when none was passed.
if [ "$LOCAL_ONLY" = "0" ] && [ -z "$HOST" ]; then
  echo "Choose a deploy target:"
  echo "  1) PersonalVPS"
  echo "  2) my-vps"
  printf "  [1/2, default 1]: "
  read -r choice
  case "$choice" in
    2|my-vps) HOST="my-vps" ;;
    *) HOST="PersonalVPS" ;;
  esac
fi

if [ "$LOCAL_ONLY" = "0" ]; then
  echo "Deploy target: $HOST"
fi

cd "$LOCAL_DIR"

echo "=== 1/6 Building Next.js standalone ==="
NODE_OPTIONS=--no-deprecation npx next build

STANDALONE=".next/standalone"

echo ""
echo "=== 2/6 Preparing standalone folder ==="
[ -d public ] && cp -r public "$STANDALONE/"
[ -d .next/static ] && cp -r .next/static "$STANDALONE/.next/"
cp ecosystem.config.cjs package.json "$STANDALONE/"

echo ""
echo "=== 3/6 Bootstrapping linux-x64 native binaries ==="
# The local build installs darwin binaries. Re-fetch the linux variants with
# npm's platform flags (works from macOS) and merge them into the pnpm store,
# linking them the same way pnpm does. Covers sharp (any version, incl. the
# @img/sharp-linux-x64 optional deps of sharp >= 0.33) plus NATIVE_DEPS.
# Merge a scratch npm install into the standalone's pnpm store and link it
# the same way pnpm does, so the linux binaries are found at runtime.
merge_into_store() {
  local scratch="$1"
  local pj rel ver encoded target prefix name nmdir
  while IFS= read -r pj; do
    rel="${pj#"$scratch/node_modules/"}"
    rel="${rel%/package.json}"
    case "$rel" in .bin|.*|node_modules/*) continue ;; esac
    ver="$(node -p "require('$pj').version")"
    encoded="${rel//\//+}"
    target="$STANDALONE/node_modules/.pnpm/${encoded}@${ver}/node_modules/${rel}"
    mkdir -p "$(dirname "$target")"
    rsync -a "$(dirname "$pj")/" "$target/"

    # Link exactly like pnpm: scoped packages get a top-level link plus a
    # link inside every existing package's nested node_modules/<scope>.
    case "$rel" in
      @*/*)
        name="${rel#*/}"
        prefix="../"
        while IFS= read -r nmdir; do
          if [ ! -e "$nmdir/$name" ]; then
            ln -sfn "../../../${encoded}@${ver}/node_modules/${rel}" "$nmdir/$name"
          fi
        done < <(find "$STANDALONE/node_modules/.pnpm" -mindepth 3 -maxdepth 3 -type d -name "${rel%%/*}" 2>/dev/null || true)
        ;;
      *) prefix="" ;;
    esac

    # Only create missing top-level links so existing direct-dep links (e.g.
    # node_modules/sharp -> sharp@0.32.6) keep pointing at their own version.
    if [ ! -e "$STANDALONE/node_modules/$rel" ]; then
      mkdir -p "$(dirname "$STANDALONE/node_modules/$rel")"
      ln -sfn "${prefix}.pnpm/${encoded}@${ver}/node_modules/${rel}" "$STANDALONE/node_modules/$rel"
    fi
    echo "   + $rel@$ver (linux-x64)"
  done < <(find "$scratch/node_modules" -mindepth 1 -maxdepth 3 -name package.json)
}

install_linux_natives() {
  local pkgs=()
  local v
  for v in $(ls "$STANDALONE/node_modules/.pnpm" 2>/dev/null | grep -E '^sharp@' | sed 's/^sharp@//' || true); do
    pkgs+=("sharp@$v")
  done
  if [ -n "$NATIVE_DEPS" ]; then
    read -ra extra <<< "$NATIVE_DEPS"
    pkgs+=("${extra[@]}")
  fi
  if [ "${#pkgs[@]}" -eq 0 ]; then
    echo "   no native packages found, nothing to do"
    return
  fi

  # One scratch install per package: npm dedupes same-name packages to a
  # single version, and the npm_config_* env vars are what both npm's
  # optional-dep resolution and sharp's prebuild installer actually respect.
  local pkg scratch
  for pkg in "${pkgs[@]}"; do
    echo "   fetching linux binaries for: $pkg"
    scratch="$(mktemp -d)"
    ( cd "$scratch" && npm init -y >/dev/null 2>&1 && \
      npm_config_platform=linux npm_config_os=linux npm_config_arch=x64 npm_config_libc=glibc \
      npm install --no-save --os=linux --cpu=x64 --libc=glibc "$pkg" >/dev/null 2>&1 ) || true
    merge_into_store "$scratch"
    rm -rf "$scratch"
  done
}
install_linux_natives

if [ "$LOCAL_ONLY" = "1" ]; then
  echo ""
  echo "=== LOCAL-ONLY: skipping sync. Standalone ready at: $LOCAL_DIR/$STANDALONE ==="
  exit 0
fi

echo ""
echo "=== 4/6 Syncing to VPS ==="
rsync -avz --delete --progress \
  "$STANDALONE/" \
  "$HOST:$REMOTE_DIR/.next/standalone/"

echo ""
echo "=== 5/6 Copying ecosystem.config.cjs to remote root ==="
rsync -avz ecosystem.config.cjs "$HOST:$REMOTE_DIR/ecosystem.config.cjs"

echo ""
echo "=== 6/6 Restarting PM2 ==="
ssh "$HOST" "source ~/.nvm/nvm.sh && cd $REMOTE_DIR && \
  pm2 startOrRestart ecosystem.config.cjs --update-env && pm2 save"

echo ""
echo "Done. Deployed standalone build to $HOST:$REMOTE_DIR"
