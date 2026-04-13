#!/bin/sh
set -e

SENTINEL="/app/.node_modules_sha"
NEED_SYNC=0

if [ ! -d "/app/node_modules" ]; then
  echo "[storefront] node_modules not found — syncing from image"
  NEED_SYNC=1
elif [ ! -f "$SENTINEL" ]; then
  echo "[storefront] node_modules sentinel missing — resyncing"
  NEED_SYNC=1
elif [ "$(cat "$SENTINEL" 2>/dev/null)" != "$STOREFRONT_IMAGE_SHA" ]; then
  echo "[storefront] Image updated ($STOREFRONT_IMAGE_SHA) — refreshing node_modules"
  NEED_SYNC=1
else
  echo "[storefront] node_modules up to date (sha: $STOREFRONT_IMAGE_SHA)"
fi

if [ "$NEED_SYNC" = "1" ]; then
  echo "[storefront] Copying /deps/node_modules → /app/node_modules ..."
  rm -rf /app/node_modules
  cp -a /deps/node_modules /app/node_modules
  echo "$STOREFRONT_IMAGE_SHA" > "$SENTINEL"

  # Install store-specific packages not in the base image
  # (e.g. added via the AI bun_add tool). No-op if nothing extra in package.json.
  if [ -f "/app/package.json" ]; then
    echo "[storefront] Running bun install for store-specific packages..."
    cd /app && bun install --no-frozen-lockfile 2>/dev/null || true
  fi

  echo "[storefront] node_modules ready"
fi

cd /app
exec "$@"
