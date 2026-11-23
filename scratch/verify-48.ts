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

console.log("Total duplicates within 48:", dups);
console.log("Unique questions:", seen.size);

// Check if any overlap with Chapter 1 ("ভূগোল ও পরিবেশ")
const ch1Keywords = ["ভূগোল বলতে", "মৃত্তিকা ভূগোল", "পানিবিদ্যা", "পরিবেশ বলতে কী বোঝ"];
let ch1Overlap = 0;
questions.forEach((q: any, idx: number) => {
  if (ch1Keywords.some(k => q.question.includes(k))) {
    console.log(`Potential Ch 1 question at [${idx}]: "${q.question}"`);
    ch1Overlap++;
  }
});
console.log("Chapter 1 leakage count:", ch1Overlap);
