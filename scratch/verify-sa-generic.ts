import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-sa.json"), "utf8"));
const questions = data.questions || [];

function norm(str: string) {
  return str.replace(/[।?？！.,:;\"'“”‘’—\-\s]/g, "").trim().toLowerCase();
}

console.log("Chapter:", data.chapterTitle);
console.log("Total questions:", questions.length);

const seen = new Map<string, number>();
let dups = 0;
questions.forEach((q: any, idx: number) => {
  const n = norm(q.question);
  if (seen.has(n)) {
    console.log(`Duplicate at [${idx}] matches [${seen.get(n)}]: "${q.question}"`);
    dups++;
  } else {
    seen.set(n, idx);
  }
});

console.log("Total duplicates:", dups);
console.log("Unique questions:", seen.size);
