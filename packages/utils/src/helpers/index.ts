/**
 * Utility helper functions.
 */

/**
 * Format date into a human readable string.
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d = new Date(date)
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...options,
  })
}

/**
 * Capitalize first letter of a string.
 */
export function capitalize(str: string): string {
  if (!str) return ""
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

/**
 * Truncate text with ellipsis if it exceeds maxLength.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Parses a tenant slug or custom domain from an HTTP Host header value.
 *
 * Resolution logic:
 *  1. Localhost subdomains   → "test.localhost[:port]"  → slug = "test"
 *  2. Main-domain subdomains → "test.up-hub.com"        → slug = "test"
 *  3. Custom domains         → "myunion.gov.bd"         → customDomain = "myunion.gov.bd"
 *  4. Bare root / unknown    → "localhost" / "up-hub.com" → both null
 *
 * @param host        Raw value of the HTTP Host header (may include port)
 * @param mainDomain  The root domain of the platform (e.g. "up-hub.com").
 *                    Callers should derive this from their env vars and pass it in.
 *                    Defaults to "" which means only localhost subdomain detection runs.
 */
export function parseTenantHost(
  host: string | null | undefined,
  mainDomain = "",
): { slug: string | null; customDomain: string | null } {
  if (!host) return { slug: null, customDomain: null }

  // Strip port (e.g. "test.localhost:3001" → "test.localhost")
  const clean = host.split(":")[0] ?? ""
  if (!clean) return { slug: null, customDomain: null }

  // ── Localhost subdomains ──────────────────────────────────────────────────
  // "test.localhost" → parts = ["test", "localhost"]
  if (clean.endsWith("localhost")) {
    const parts = clean.split(".")
    const sub = parts.length === 2 ? parts[0] : null
    if (sub && sub !== "www") return { slug: sub, customDomain: null }
    return { slug: null, customDomain: null }
  }

  // ── Main-domain subdomains ────────────────────────────────────────────────
  // "test.up-hub.com" → sub = "test"
  const root = mainDomain.replace(/^https?:\/\//, "")
  if (root && clean !== root && clean.endsWith(`.${root}`)) {
    const sub = clean.slice(0, -(root.length + 1))
    if (sub && sub !== "www") return { slug: sub, customDomain: null }
    return { slug: null, customDomain: null }
  }

  // ── Custom domain ─────────────────────────────────────────────────────────
  // Anything that is not the bare root domain is treated as a custom domain
  if (!root || clean !== root) {
    return { slug: null, customDomain: clean }
  }

  return { slug: null, customDomain: null }
}

/**
 * Generates a unique Citizen ID: YY + 7-digit GeoCode + 6-digit incrementing counter.
 */
export function generateCitizenId(
  geoCode: string | null | undefined,
  counterValue: number,
): string {
  const yearSuffix = new Date().getFullYear().toString().slice(-2)
  const cleanGeo = (geoCode || "").replace(/\D/g, "").padStart(7, "0").slice(0, 7)
  const cleanCounter = counterValue.toString().padStart(6, "0")
  return `${yearSuffix}${cleanGeo}${cleanCounter}`
}


