/**
 * DB Reset Script — Data Only
 *
 * Deletes all records from every table using TRUNCATE ... RESTART IDENTITY CASCADE.
 * The schema and migrations are left untouched.
 */

import { config } from 'dotenv';
import { resolve } from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/main/client.js';

config({ path: resolve(import.meta.dirname, '../../.env') });

const connectionString = process.env.MAIN_DATABASE_URL;
if (!connectionString) {
  console.error('\x1b[31m✖ MAIN_DATABASE_URL is not set in .env\x1b[0m');
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const TABLES = [
  '"user"',
  '"session"',
  '"account"',
  '"verification"',
  '"role"',
  '"subscription"',
  '"fiscal_year"',
];

async function main() {
  console.log('\n\x1b[33m━━━ Resetting MAIN database (data only) ━━━\x1b[0m');
  console.log('\x1b[90mUsing: TRUNCATE ... RESTART IDENTITY CASCADE\x1b[0m\n');

  const tableList = TABLES.join(', ');
  const sql = `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`;

  try {
    await db.$executeRawUnsafe(sql);
    console.log('\x1b[32m✔ All records deleted. Schema is preserved.\x1b[0m\n');
  } catch (err: any) {
    console.warn('\x1b[33m⚠ Bulk truncate failed, trying table-by-table...\x1b[0m');
    let failed = 0;
    for (const table of TABLES) {
      try {
        await db.$executeRawUnsafe(`TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`);
        console.log(`  \x1b[32m✔\x1b[0m ${table}`);
      } catch (e: any) {
        console.warn(`  \x1b[33m⚠ Skipped ${table}: ${e.message}\x1b[0m`);
        failed++;
      }
    }
    if (failed === TABLES.length) {
      console.error('\x1b[31m✖ All truncates failed. Is the database reachable?\x1b[0m');
      process.exit(1);
    }
  }
}

main()
  .catch((e) => {
    console.error('\n\x1b[31m✖ Reset failed:\x1b[0m', e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
