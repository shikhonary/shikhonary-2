import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import katex from "katex";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

config({ path: resolve(WORKSPACE_ROOT, ".env") });
config({ path: resolve(WORKSPACE_ROOT, "packages/db/.env") });

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../packages/db/generated/main/client.ts";

const connectionString = process.env.MAIN_DATABASE_URL || process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const filePath = resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json");
  const raw = readFileSync(filePath, "utf8");
  const data = JSON.parse(raw);
  const cqs = data.cqs || data.questions || [];

  console.log("=== FILE METADATA ===");
  console.log("Chapter Title:", data.chapterTitle);
  console.log("Total CQs in file:", cqs.length);

  let mathCqCount = 0;
  let mathExpressionsTested = 0;
  let katexErrors: string[] = [];
  let tableCount = 0;

  const textFields = ["context", "bottomContent", "questionA", "questionB", "questionC", "questionD"];

  cqs.forEach((cq: any, idx: number) => {
    let cqHasMath = false;

    // Check standard text fields
    textFields.forEach((field) => {
      const val = cq[field];
      if (!val || typeof val !== "string") return;

      const inlineMatches = val.match(/\$([^$\n]+?)\$/g) || [];
      const displayMatches = val.match(/\$\$([\s\S]*?)\$\$/g) || [];
      const slashRoundMatches = val.match(/\\\(([\s\S]*?)\\\)/g) || [];
      const slashSquareMatches = val.match(/\\\[([\s\S]*?)\\\]/g) || [];

      const allMatches = [
        ...inlineMatches.map((m: string) => ({ type: "inline", expr: m.slice(1, -1) })),
        ...displayMatches.map((m: string) => ({ type: "display", expr: m.slice(2, -2) })),
        ...slashRoundMatches.map((m: string) => ({ type: "slashRound", expr: m.slice(2, -2) })),
        ...slashSquareMatches.map((m: string) => ({ type: "slashSquare", expr: m.slice(2, -2) })),
      ];

      if (allMatches.length > 0) {
        cqHasMath = true;
        allMatches.forEach(({ type, expr }) => {
          mathExpressionsTested++;
          try {
            katex.renderToString(expr.trim(), {
              displayMode: type === "display" || type === "slashSquare",
              throwOnError: true,
            });
          } catch (err: any) {
            katexErrors.push(`CQ #${idx + 1} [${field}]: ${err.message} in expr "${expr}"`);
          }
        });
      }

      const dollarCount = (val.match(/\$/g) || []).length;
      if (dollarCount % 2 !== 0) {
        katexErrors.push(`CQ #${idx + 1} [${field}] unclosed dollar sign: "${val}"`);
      }
    });

    // Check table cells if table exists
    if (cq.table) {
      tableCount++;
      const headers = cq.table.headers || [];
      const rows = cq.table.rows || [];

      const allCells = [...headers, ...rows.flat()];
      allCells.forEach((cell: any, cIdx: number) => {
        if (!cell || typeof cell !== "string") return;
        const inlineMatches = cell.match(/\$([^$\n]+?)\$/g) || [];
        inlineMatches.forEach((m: string) => {
          cqHasMath = true;
          mathExpressionsTested++;
          const expr = m.slice(1, -1);
          try {
            katex.renderToString(expr.trim(), { displayMode: false, throwOnError: true });
          } catch (err: any) {
            katexErrors.push(`CQ #${idx + 1} Table cell [${cIdx}]: ${err.message} in expr "${expr}"`);
          }
        });
        const dollarCount = (cell.match(/\$/g) || []).length;
        if (dollarCount % 2 !== 0) {
          katexErrors.push(`CQ #${idx + 1} Table cell unclosed dollar sign: "${cell}"`);
        }
      });
    }

    if (cqHasMath || cq.isMath) {
      mathCqCount++;
      console.log(`\n[Math in CQ #${idx + 1}] isMath: ${cq.isMath}`);
      textFields.forEach((field) => {
        if (cq[field] && (/\$/.test(cq[field]) || /\\/.test(cq[field]))) {
          console.log(`  ${field}: ${cq[field]}`);
        }
      });
      if (cq.table) {
        console.log(`  table:`, JSON.stringify(cq.table));
      }
    }
  });

  console.log("\n=== MATH SYNTAX & TABLE VALIDATION SUMMARY ===");
  console.log("Total CQs examined:", cqs.length);
  console.log("Total CQs with Table structure:", tableCount);
  console.log("CQs flagged with isMath or containing math delimiters:", mathCqCount);
  console.log("Total math expressions tested with KaTeX:", mathExpressionsTested);
  console.log("KaTeX rendering errors:", katexErrors.length);
  if (katexErrors.length > 0) {
    console.log("Errors detail:", katexErrors);
  } else {
    console.log("All math expressions passed KaTeX validation with 0 errors!");
  }

  // Check references for "প্রশ্ন" or "প্রশ্ন নং"
  let badRefCount = 0;
  let cleanRefCount = 0;
  cqs.forEach((cq: any, idx: number) => {
    (cq.reference || []).forEach((r: string) => {
      if (r.startsWith("প্রশ্ন") || r.startsWith("প্রশ্ন নং")) {
        badRefCount++;
      } else {
        cleanRefCount++;
      }
    });
  });
  console.log(`\nReferences summary: Clean refs: ${cleanRefCount}, 'প্রশ্ন/প্রশ্ন নং' refs: ${badRefCount}`);

  // Database CQ status for Class 9/10 Science
  console.log("\n=== DATABASE CQ STATUS (Class 9/10 Science) ===");
  const chapters = await prisma.academicChapter.findMany({
    where: {
      subject: {
        OR: [{ nameEn: "Science" }, { nameBn: "বিজ্ঞান" }],
        academicYear: { isCurrent: true },
        classSubjects: {
          some: {
            academicClass: {
              OR: [{ nameEn: "Nine" }, { nameBn: "নবম" }, { nameEn: "Ten" }, { nameBn: "দশম" }],
            },
          },
        },
      },
    },
    orderBy: { position: "asc" },
    select: {
      id: true,
      nameBn: true,
      position: true,
      _count: {
        select: {
          cqs: true,
          shortAnswers: true,
          mcqs: true,
        },
      },
    },
  });

  let totalCQsSeeded = 0;
  let remainingCqChapters = 0;
  chapters.forEach((ch: any) => {
    totalCQsSeeded += ch._count.cqs;
    if (ch._count.cqs === 0) remainingCqChapters++;
    console.log(`Pos ${ch.position}: ${ch.nameBn} -> CQs: ${ch._count.cqs}, SAs: ${ch._count.shortAnswers}, MCQs: ${ch._count.mcqs}`);
  });

  console.log(`\nTotal seeded CQs in DB: ${totalCQsSeeded}`);
  console.log(`Chapters with 0 CQs: ${remainingCqChapters} of ${chapters.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
