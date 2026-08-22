import { execSync } from 'node:child_process';

const targetUrl = "postgresql://neondb_owner:npg_9t8HcoZjEDaJ@ep-falling-cherry-axiebimn-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require";

console.log("Deploying Prisma migrations to target database...");
console.log("Target URL:", targetUrl);

try {
  const output = execSync('npx prisma migrate deploy --config packages/db/prisma/main/prisma.config.ts', {
    env: {
      ...process.env,
      MAIN_DATABASE_URL: targetUrl
    },
    encoding: 'utf-8',
    cwd: process.cwd()
  });
  console.log("Prisma Migrate Deploy Output:\n", output);
} catch (err) {
  console.error("Migration deployment failed:");
  if (err.stdout) console.log("STDOUT:\n", err.stdout);
  if (err.stderr) console.error("STDERR:\n", err.stderr);
  process.exit(1);
}
