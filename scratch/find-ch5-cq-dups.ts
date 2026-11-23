import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json"), "utf8"));
const cqs = data.questions || [];

function norm(str: string) {
  if (!str) return "";
  return str.replace(/[।?？！.,:;\"'“”‘’—\-\s$]/g, "").trim().toLowerCase();
}

console.log(`Checking duplicates among ${cqs.length} CQs...`);

let dupCount = 0;
for (let i = 0; i < cqs.length; i++) {
  for (let j = i + 1; j < cqs.length; j++) {
    const cq1 = cqs[i];
    const cq2 = cqs[j];

    const matchA = norm(cq1.questionA) === norm(cq2.questionA);
    const matchB = norm(cq1.questionB) === norm(cq2.questionB);
    const matchC = norm(cq1.questionC) === norm(cq2.questionC);
    const matchD = norm(cq1.questionD) === norm(cq2.questionD);

    const matches = [matchA, matchB, matchC, matchD].filter(Boolean).length;
    if (matches >= 3) {
      console.log(`Match (${matches}/4) between [${i}] and [${j}]:`);
      console.log(`[${i}] Ref: ${JSON.stringify(cq1.reference)}`);
      console.log(`[${j}] Ref: ${JSON.stringify(cq2.reference)}`);
      dupCount++;
    }
  }
}

console.log(`Total duplicate pairs: ${dupCount}`);
