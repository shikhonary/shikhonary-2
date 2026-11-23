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

console.log("Checking context / stimulus duplicates...");
const contextMap = new Map<string, number[]>();

cqs.forEach((cq: any, idx: number) => {
  const ctx = norm(cq.context || cq.attachmentDescription || "");
  if (!ctx) return;
  if (!contextMap.has(ctx)) {
    contextMap.set(ctx, []);
  }
  contextMap.get(ctx)!.push(idx);
});

let totalSharedContext = 0;
for (const [ctx, indices] of contextMap.entries()) {
  if (indices.length > 1) {
    totalSharedContext += indices.length - 1;
    console.log(`\nShared context (${indices.length} questions): indices [${indices.join(", ")}]`);
    console.log(`Context preview: ${cqs[indices[0]].context?.substring(0, 60) || cqs[indices[0]].attachmentDescription?.substring(0, 60)}`);
    indices.forEach(idx => {
      console.log(`  [${idx}] A: "${cqs[idx].questionA}" | B: "${cqs[idx].questionB}" | C: "${cqs[idx].questionC?.substring(0, 30)}"`);
    });
  }
}

console.log(`\nTotal duplicate/shared context occurrences: ${totalSharedContext}`);
console.log(`58 - ${totalSharedContext} = ${58 - totalSharedContext}`);
