import Medusa from "@medusajs/js-sdk"

const baseConfig = {
  baseUrl: process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  debug: process.env.NODE_ENV === "development",
  globalHeaders: {
    ...(process.env.NEXT_PUBLIC_STORE_ID
      ? { "X-Store-Environment-ID": process.env.NEXT_PUBLIC_STORE_ID }
      : {}),
  },
}

/**
 * Forward the per-visitor id (`amb_vid`, minted by the edge middleware) to
 * Medusa on EVERY server-side request to the backend, so the server-side PDP
 * A/B override can pick the visitor's sticky variant when it renders the
 * product title / description / images.
 *
 * Why a fetch shim and not `globalHeaders`: medusaServerClient is a module
 * singleton, but `amb_vid` differs per request — a header baked in at
 * construction would pin every visitor to whoever loaded the module first.
 * The Medusa SDK calls the global `fetch` at call-time (it does not capture a
 * reference at import), so a tiny, idempotent shim that reads the cookie from
 * the active request via next/headers and adds `x-amb-vid` is the correct
 * per-request hook — with no change to any call site.
 *
 * Strictly server-side and scoped to the Medusa backend URL; every other fetch
 * passes through untouched. Fail-OPEN: outside a request scope (build,
 * background revalidation) or with no cookie, the request is forwarded
 * unchanged — identical to prior behaviour.
 */
if (typeof window === "undefined") {
  const g = globalThis as typeof globalThis & { __ambVidFetchPatched?: boolean }
  if (!g.__ambVidFetchPatched) {
    g.__ambVidFetchPatched = true
    const backendUrl = baseConfig.baseUrl
    const originalFetch = g.fetch
    g.fetch = async (input: Parameters<typeof fetch>[0], init?: Parameters<typeof fetch>[1]) => {
      try {
        const url =
          typeof input === "string"
            ? input
            : input instanceof URL
              ? input.href
              : (input as Request)?.url ?? ""
        if (backendUrl && url.startsWith(backendUrl)) {
          const { cookies } = await import("next/headers")
          const ambVid = (await cookies()).get("amb_vid")?.value
          if (ambVid) {
            const headers = new Headers(
              init?.headers ??
                (typeof input === "object" && input && "headers" in input
                  ? (input as Request).headers
                  : undefined),
            )
            if (!headers.has("x-amb-vid")) headers.set("x-amb-vid", ambVid)
            init = { ...init, headers }
          }
        }
      } catch {
        // No request scope / no cookie / anything → forward unchanged.
      }
      return originalFetch(input, init)
    }
  }
}

/**
 * Client-side SDK — uses localStorage for JWT persistence.
 * Use ONLY in 'use client' components and hooks (use-auth, use-cart, etc.)
 */
let _medusaClient: Medusa | null = null

/** Read the visitor id minted by the edge layer (browser-only). */
function getAmbVid(): string | undefined {
  if (typeof document === "undefined") return undefined
  for (const part of document.cookie.split(";")) {
    const eq = part.indexOf("=")
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === "amb_vid") {
      return decodeURIComponent(part.slice(eq + 1).trim())
    }
  }
  return undefined
}

export function getMedusaClient(): Medusa {
  if (!_medusaClient) {
    const ambVid = getAmbVid()
    _medusaClient = new Medusa({
      ...baseConfig,
      globalHeaders: {
        ...baseConfig.globalHeaders,
        ...(ambVid ? { "x-amb-vid": ambVid } : {}),
      },
      auth: {
        type: "jwt",
        jwtTokenStorageMethod: "local",
        jwtTokenStorageKey: "medusa_auth_token",
      },
    })
  }
  return _medusaClient
}

/**
 * Server-side SDK — no auth storage (localStorage not available in SSR).
 * Per-visitor x-amb-vid forwarding is handled by the server fetch shim above.
 */
export const medusaServerClient = new Medusa({
  ...baseConfig,
  auth: {
    type: "jwt",
    jwtTokenStorageMethod: "memory",
  },
})
