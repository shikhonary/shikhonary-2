/**
 * GET /api/health
 *
 * Lightweight health check endpoint for Docker/K8s orchestrators.
 * Returns 200 OK when the Next.js process is alive and accepting connections.
 * Referenced by the HEALTHCHECK directive in Dockerfile.tenant.
 */
export async function GET() {
  return new Response("OK", {
    status: 200,
    headers: { "Content-Type": "text/plain" },
  });
}
