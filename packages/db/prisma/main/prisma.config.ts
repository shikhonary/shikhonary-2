import { config } from "dotenv"
import { resolve } from "node:path"
import { defineConfig } from "prisma/config"

// Explicitly load .env from the package root so this works under Turborepo
config({ path: resolve(import.meta.dirname, "../../.env") })

function getDirectUrl(url?: string) {
  if (!url) return url
  if (process.env.DIRECT_URL) return process.env.DIRECT_URL
  return url.replace("-pooler.", ".")
}

export default defineConfig({
  schema: resolve(import.meta.dirname, "schema.prisma"),
  migrations: {
    path: resolve(import.meta.dirname, "migrations"),
  },
  datasource: {
    url: getDirectUrl(process.env.MAIN_DATABASE_URL),
  },
})

