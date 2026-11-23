import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const cqData = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json"), "utf8"));
const saData = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-sa.json"), "utf8"));

const cqs = cqData.questions || [];
const sas = saData.questions || [];

console.log(`Total CQs in test-cq.json: ${cqs.length}`);
console.log(`Total SAs in test-sa.json: ${sas.length}`);
console.log(`Total A+B in CQs: ${cqs.length * 2}`);

const cqA = cqs.map((c: any) => c.questionA);
const cqB = cqs.map((c: any) => c.questionB);
const allCqSub = [...cqA, ...cqB];

console.log("\nUnique A in CQs:", new Set(cqA).size);
console.log("Unique B in CQs:", new Set(cqB).size);
console.log("Unique A+B in CQs:", new Set(allCqSub).size);

function norm(str: string) {
  return str.replace(/[।?？！.,:;\"'“”‘’—\-\s]/g, "").trim().toLowerCase();
}

const normSaSet = new Set(sas.map((s: any) => norm(s.question)));
let matchCount = 0;
allCqSub.forEach((q: string) => {
  if (normSaSet.has(norm(q))) {
    matchCount++;
  }
});

console.log(`How many CQ (A+B) are in SA: ${matchCount} / ${allCqSub.length}`);
