# ── Stage 1: Install dependencies ────────────────────────────────────────────
# Uses bun for fast, deterministic installs via frozen lockfile.
# This layer is cached by Docker and only re-runs when package.json or bun.lock changes.
FROM oven/bun:1-alpine AS deps

WORKDIR /deps
COPY storefront/package.json storefront/bun.lock* ./
RUN bun install --frozen-lockfile

# ── Stage 2: Runtime image ────────────────────────────────────────────────────
# Bun image includes Node.js — no need for a separate node image.
# node_modules live at /deps/node_modules (separate from store code).
# Store source code is mounted at /app at runtime via Docker volume.
FROM oven/bun:1-alpine AS runner

# Copy pre-installed node_modules from the deps stage
WORKDIR /deps
COPY --from=deps /deps/node_modules ./node_modules

# Entrypoint syncs node_modules into the store workspace on first start
# and whenever the image is updated (detected via IMAGE_SHA sentinel file).
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Baked in at build time so the entrypoint can detect when the image changed
# and needs to refresh a store's node_modules on disk.
ARG IMAGE_SHA=unknown
ENV STOREFRONT_IMAGE_SHA=${IMAGE_SHA}

# Store workspace will be mounted here at runtime
VOLUME ["/app"]

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]

# Reads scripts from /app/package.json (the mounted store workspace).
# PORT env var controls the port (defaults to 3000 in the dev script).
CMD ["bun", "run", "dev"]
