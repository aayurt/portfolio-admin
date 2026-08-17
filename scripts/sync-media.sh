#!/bin/bash
set -e

HOST="PersonalVPS"
BASE_PATH="/var/www/portfolio-admin/public"
LOCAL_BASE="$(dirname "$0")/../public"

sync_dir() {
  local dir=$1
  mkdir -p "$LOCAL_BASE/$dir"
  echo "Syncing $dir ..."
  rsync -avz --progress --delete "$HOST:$BASE_PATH/$dir/" "$LOCAL_BASE/$dir/"
}

sync_dir "media"
sync_dir "images"

echo "Done."
