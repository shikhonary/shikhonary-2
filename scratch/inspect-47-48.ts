import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-sa.json"), "utf8"));
const questions = data.questions || [];

console.log("Q 47:", JSON.stringify(questions[47], null, 2));
console.log("Q 48:", JSON.stringify(questions[48], null, 2));
console.log("Q 62:", JSON.stringify(questions[62], null, 2));
