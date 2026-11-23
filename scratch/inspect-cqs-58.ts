import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json"), "utf8"));
const cqs = data.questions || [];

console.log("Total CQs in test-cq.json:", cqs.length);
console.log("Chapter title in test-cq.json:", data.chapterTitle);

// Print all 58 CQs summary
cqs.forEach((cq: any, idx: number) => {
  const ctx = (cq.context || cq.attachmentDescription || "").replace(/\n/g, " ").substring(0, 40);
  console.log(`${idx}: [${cq.difficulty}] A: "${cq.questionA}" | Ctx: "${ctx}"`);
});
