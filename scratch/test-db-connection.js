import pkg from '../packages/db/node_modules/pg/lib/index.js';
const { Client } = pkg;

const sourceUrl = "postgresql://neondb_owner:npg_SBrkyE5VIj8d@ep-blue-dust-azx774g3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const targetUrl = "postgresql://neondb_owner:npg_I8FsSLWx9ymG@ep-round-night-azalud9d-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function checkDb(name, url) {
  const client = new Client({ connectionString: url });
  try {
    await client.connect();
    console.log(`Successfully connected to ${name}`);
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    console.log(`${name} tables:`, res.rows.map(r => r.table_name));

    for (const row of res.rows) {
      const countRes = await client.query(`SELECT COUNT(*) FROM "${row.table_name}";`);
      console.log(`  Table ${row.table_name}: ${countRes.rows[0].count} rows`);
    }
  } catch (err) {
    console.error(`Error connecting to ${name}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  console.log("--- Source DB ---");
  await checkDb("Source DB", sourceUrl);
  console.log("\n--- Target DB ---");
  await checkDb("Target DB", targetUrl);
}

main();
