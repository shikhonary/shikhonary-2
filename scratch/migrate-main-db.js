import pkg from '../packages/db/node_modules/pg/lib/index.js';
const { Client } = pkg;

const sourceUrl = "postgresql://neondb_owner:npg_SBrkyE5VIj8d@ep-blue-dust-azx774g3-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";
const targetUrl = "postgresql://neondb_owner:npg_I8FsSLWx9ymG@ep-round-night-azalud9d-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

// List of tables in topological order (dependencies first)
const tablesInOrder = [
  '_prisma_migrations',
  'role',
  'user',
  'account',
  'session',
  'verification',
  '_RoleToUser',
  'academic_class',
  'Subject',
  'AcademicClassSubject',
  'Chapter',
  'Mcq',
  'Student',
  'Exam',
  'ExamAttempt',
  'AnswerHistory',
  'exam_subject',
  'exam_group',
  'exam_group_item',
  'exam_group_result',
  'proctoring_violation'
];

async function migrate() {
  const sourceClient = new Client({ connectionString: sourceUrl });
  const targetClient = new Client({ connectionString: targetUrl });

  try {
    console.log("Connecting to Source & Target DBs...");
    await sourceClient.connect();
    await targetClient.connect();

    // Fetch existing tables from source DB to ensure we migrate all existing base tables
    const tableRes = await sourceClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const existingTables = tableRes.rows.map(r => r.table_name);

    // Merge tablesInOrder with any extra tables found in source DB
    const finalTableList = [...tablesInOrder];
    for (const t of existingTables) {
      if (!finalTableList.includes(t)) {
        finalTableList.push(t);
      }
    }

    console.log(`Tables to migrate (${finalTableList.length}):`, finalTableList);

    for (const table of finalTableList) {
      if (!existingTables.includes(table)) {
        console.log(`Table "${table}" not found in source DB, skipping.`);
        continue;
      }

      console.log(`\nMigrating table: "${table}"...`);

      // Fetch column details from source DB
      const colsRes = await sourceClient.query(`
        SELECT column_name, data_type, udt_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      const columns = colsRes.rows.map(r => `"${r.column_name}"`);
      const colNamesStr = columns.join(', ');

      // Fetch all rows from source table
      const rowsRes = await sourceClient.query(`SELECT * FROM "${table}";`);
      const rows = rowsRes.rows;
      console.log(`  Source rows count: ${rows.length}`);

      if (rows.length === 0) {
        console.log(`  No data in "${table}", skipping inserts.`);
        continue;
      }

      // Truncate target table before inserting to prevent duplicate key conflicts
      await targetClient.query(`TRUNCATE TABLE "${table}" CASCADE;`);

      // Batch insert rows
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const chunk = rows.slice(i, i + batchSize);
        const valuePlaceholders = [];
        const queryParams = [];
        let paramIdx = 1;

        for (const row of chunk) {
          const rowPlaceholders = [];
          for (const colRes of colsRes.rows) {
            const colName = colRes.column_name;
            let val = row[colName];

            // If column is json/jsonb and value is object/array (not null), stringify for pg if needed, or pass object
            if ((colRes.data_type === 'json' || colRes.data_type === 'jsonb' || colRes.udt_name === 'json' || colRes.udt_name === 'jsonb') && val !== null && typeof val === 'object') {
              val = JSON.stringify(val);
            }

            rowPlaceholders.push(`$${paramIdx}`);
            queryParams.push(val);
            paramIdx++;
          }
          valuePlaceholders.push(`(${rowPlaceholders.join(', ')})`);
        }

        const insertSql = `INSERT INTO "${table}" (${colNamesStr}) VALUES ${valuePlaceholders.join(', ')};`;
        await targetClient.query(insertSql, queryParams);
      }

      // Verify row count in target table
      const targetCountRes = await targetClient.query(`SELECT COUNT(*) FROM "${table}";`);
      const targetCount = parseInt(targetCountRes.rows[0].count, 10);
      console.log(`  Successfully inserted into "${table}". Target row count: ${targetCount}`);

      if (targetCount !== rows.length) {
        throw new Error(`Row count mismatch in table "${table}"! Source: ${rows.length}, Target: ${targetCount}`);
      }
    }

    console.log("\n=============================================");
    console.log("MIGRATION COMPLETED SUCCESSFULLY WITH 100% PARITY!");
    console.log("=============================================");

  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  } finally {
    await sourceClient.end().catch(() => {});
    await targetClient.end().catch(() => {});
  }
}

migrate();
