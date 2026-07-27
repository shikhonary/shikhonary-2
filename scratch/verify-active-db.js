import pkg from '../packages/db/node_modules/pg/lib/index.js';
import fs from 'node:fs';
import path from 'node:path';

const { Client } = pkg;

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const match = envContent.match(/^MAIN_DATABASE_URL=["']?([^"'\r\n]+)["']?/m);
const currentUrl = match ? match[1] : null;

async function main() {
  console.log("Connecting to current active MAIN_DATABASE_URL from .env...");
  console.log("URL:", currentUrl);

  const client = new Client({ connectionString: currentUrl });
  try {
    await client.connect();
    console.log("Successfully connected to active MAIN_DATABASE_URL!");
    
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log(`Found ${res.rows.length} tables in active database:`);

    let totalRows = 0;
    for (const row of res.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}";`);
      const count = parseInt(countRes.rows[0].count, 10);
      totalRows += count;
      console.log(`  Table "${row.table_name}": ${count} rows`);
    }

    console.log(`\nTotal verified records in active DB: ${totalRows}`);
  } catch (err) {
    console.error("Verification failed:", err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
