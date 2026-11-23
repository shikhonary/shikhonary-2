import { readFileSync } from "fs";
import { resolve } from "path";

const WORKSPACE_ROOT = process.cwd().includes("packages") || process.cwd().includes("apps")
  ? resolve(process.cwd(), "../..")
  : process.cwd();

const data = JSON.parse(readFileSync(resolve(WORKSPACE_ROOT, "scratch/raw-data/test-sa.json"), "utf8"));
const questions = data.questions || [];

for (let i = 20; i < 40; i++) {
  console.log(`${i}: ${questions[i]?.question}`);
}
