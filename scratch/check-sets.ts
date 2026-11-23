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

// Compare every question with every other question using various similarity checks
console.log("Total questions:", questions.length);

// 1. Check if questions are similar
for (let i = 0; i < questions.length; i++) {
  for (let j = i + 1; j < questions.length; j++) {
    const q1 = questions[i].question;
    const q2 = questions[j].question;
    
    // Check if one contains the other or vice versa
    const n1 = norm(q1);
    const n2 = norm(q2);
    if (n1 === n2) {
      console.log(`Exact match: [${i}] "${q1}" == [${j}] "${q2}"`);
    } else if (n1.includes(n2) || n2.includes(n1)) {
      console.log(`Substring match: [${i}] "${q1}" <-> [${j}] "${q2}"`);
    }
  }
}
