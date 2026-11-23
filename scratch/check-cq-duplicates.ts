import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-cq.json"), "utf8"));
const cqs = data.questions || [];

console.log("Total CQs in test-cq.json:", cqs.length);

function norm(str: string) {
  if (!str) return "";
  return str.replace(/[।?？！.,:;\"'“”‘’—\-\s]/g, "").trim().toLowerCase();
}

const seenContexts = new Map<string, number>();
const duplicateContexts: any[] = [];

cqs.forEach((cq: any, idx: number) => {
  const cNorm = norm(cq.context);
  // Also check signature of questionA + questionB + questionC + questionD
  const qSig = norm(cq.questionA) + "|" + norm(cq.questionB) + "|" + norm(cq.questionC) + "|" + norm(cq.questionD);
  
  if (seenContexts.has(qSig)) {
    duplicateContexts.push({
      origIdx: seenContexts.get(qSig),
      dupIdx: idx,
      type: "EXACT_QUESTIONS_MATCH",
      origA: cqs[seenContexts.get(qSig)!].questionA,
      dupA: cq.questionA,
      origContext: cqs[seenContexts.get(qSig)!].context?.substring(0, 50),
      dupContext: cq.context?.substring(0, 50),
    });
  } else if (cNorm && seenContexts.has(cNorm)) {
    duplicateContexts.push({
      origIdx: seenContexts.get(cNorm),
      dupIdx: idx,
      type: "CONTEXT_MATCH",
      origA: cqs[seenContexts.get(cNorm)!].questionA,
      dupA: cq.questionA,
      origContext: cqs[seenContexts.get(cNorm)!].context?.substring(0, 50),
      dupContext: cq.context?.substring(0, 50),
    });
  } else {
    if (cNorm) seenContexts.set(cNorm, idx);
    seenContexts.set(qSig, idx);
  }
});

console.log(`Duplicate CQs found: ${duplicateContexts.length}`);
console.log(`58 - ${duplicateContexts.length} = ${cqs.length - duplicateContexts.length}`);

duplicateContexts.forEach(d => {
  console.log(`- [Orig ${d.origIdx} vs Dup ${d.dupIdx}] Type: ${d.type}`);
  console.log(`  Orig: "${d.origContext}" | Q(A): "${d.origA}"`);
  console.log(`  Dup:  "${d.dupContext}" | Q(A): "${d.dupA}"`);
});
