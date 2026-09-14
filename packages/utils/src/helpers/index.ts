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

/**
 * Smart JSON Syntax Repair Engine for bulk import and user/AI generated JSON.
 * Fixes:
 * - Markdown code fencing
 * - Smart / curly quotes
 * - Single-line comments
 * - LaTeX commands and unescaped backslashes (e.g. \( \), \rightarrow, \frac, etc.)
 * - Trailing commas
 * - Single object missing outer array brackets
 */
export function repairJsonSyntax(raw: string): string {
  let cleaned = raw.trim()

  // 1. Strip markdown code fencing (```json ... ``` or ``` ...)
  cleaned = cleaned.replace(/^```(?:json)?\s*/gi, "").replace(/\s*```$/g, "").trim()

  // 2. Normalize smart quotes to standard quotes
  cleaned = cleaned
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")

  // 3. Strip single-line comments (// comment)
  cleaned = cleaned.replace(/^\s*\/\/.*$/gm, "")

  // 4. Fix known LaTeX commands starting with characters that are valid JSON escapes (b, f, n, r, t)
  // e.g. \rightarrow, \times, \theta, \frac, \beta, \neq, \mathbf, \text, \tan, etc.
  cleaned = cleaned.replace(
    /(?<!\\)\\(rightarrow|right|rho|rangle|Rightarrow|roots|rceil|rfloor|times|theta|text|tan|tau|tilde|to|therefore|triangle|tanh|top|tiny|textbf|textit|texttt|tfrac|tag|frac|forall|flat|beta|begin|bar|mathbf|binom|big|Big|bullet|bot|boldsymbol|bmatrix|bmod|neq|nabla|nu|not|null|neg|natural|ni|norm)\b/g,
    "\\\\$1"
  )

  // 5. Fix any unescaped backslashes that are not valid JSON escape sequences (\", \\, \/, \b, \f, \n, \r, \t, \uXXXX)
  // e.g. \(, \), \[, \], \alpha, \sum, \sqrt, \int, \le, \ge, \pm, etc.
  cleaned = cleaned.replace(/(?<!\\)\\(?!["\\/bfnrt]|u[0-9a-fA-F]{4})/g, "\\\\")

  // 6. Remove trailing commas in objects & arrays (e.g. , ] -> ] and , } -> })
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1")

  // 7. Wrap single object in array if not already an array
  if (cleaned.startsWith("{") && cleaned.endsWith("}")) {
    cleaned = `[\n${cleaned}\n]`
  }

  return cleaned
}

/**
 * Line & Column Position Diagnostic Extractor from JSON parsing error message.
 */
export function findJsonErrorPosition(raw: string, errMessage: string) {
  const lines = raw.split("\n")

  // Try position number e.g. "at position 123"
  const posMatch = errMessage.match(/position\s+(\d+)/i)
  let charPos = -1
  if (posMatch && posMatch[1]) {
    charPos = parseInt(posMatch[1], 10)
  }

  // Try line number e.g. "at line 12 column 4" or "line 12"
  const lineMatch = errMessage.match(/line\s+(\d+)/i)
  const colMatch = errMessage.match(/column\s+(\d+)/i)

  let errorLine = lineMatch && lineMatch[1] ? parseInt(lineMatch[1], 10) : -1
  let errorCol = colMatch && colMatch[1] ? parseInt(colMatch[1], 10) : -1

  if (charPos >= 0 && errorLine === -1) {
    let count = 0
    for (let i = 0; i < lines.length; i++) {
      const lineLen = (lines[i]?.length || 0) + 1 // +1 for newline
      if (count + lineLen >= charPos) {
        errorLine = i + 1
        errorCol = charPos - count + 1
        break
      }
      count += lineLen
    }
  }

  if (errorLine === -1) return null

  const targetLineIdx = Math.max(0, errorLine - 1)
  const startIdx = Math.max(0, targetLineIdx - 2)
  const endIdx = Math.min(lines.length - 1, targetLineIdx + 2)

  const linesContext = []
  for (let i = startIdx; i <= endIdx; i++) {
    linesContext.push({
      num: i + 1,
      content: lines[i] || "",
      isError: i === targetLineIdx,
    })
  }

  return {
    line: errorLine,
    col: errorCol,
    linesContext,
  }
}



