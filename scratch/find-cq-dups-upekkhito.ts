import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "raw-data/test-cq.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

function cleanText(text: string) {
  if (!text) return "";
  return text.replace(/^[ক-ঘa-d\d]+[.)।|\-\s]+/g, "").replace(/\s+/g, " ").trim();
}

console.log("Analyzing 21 CQs of উপেক্ষিত শক্তির উদ্বোধন for duplicates...\n");

// Context duplicates
const contextMap = new Map<string, number[]>();
data.questions.forEach((q: any, i: number) => {
  const c = cleanText(q.context || "");
  if (!contextMap.has(c)) contextMap.set(c, []);
  contextMap.get(c)!.push(i + 1);
});

contextMap.forEach((indices, c) => {
  if (indices.length > 1) {
    console.log(`Duplicate Context (${indices.join(", ")}): "${c.slice(0, 70)}..."`);
  }
});

// Question A + B duplicates
const abMap = new Map<string, number[]>();
data.questions.forEach((q: any, i: number) => {
  const ab = `${cleanText(q.questionA)} ||| ${cleanText(q.questionB)}`;
  if (!abMap.has(ab)) abMap.set(ab, []);
  abMap.get(ab)!.push(i + 1);
});

abMap.forEach((indices, ab) => {
  if (indices.length > 1) {
    console.log(`Duplicate Question A + B (${indices.join(", ")}): "${ab}"`);
  }
});

// Full Object duplicates
const objMap = new Map<string, number[]>();
data.questions.forEach((q: any, i: number) => {
  const key = `${cleanText(q.context)} ||| ${cleanText(q.questionA)} ||| ${cleanText(q.questionB)} ||| ${cleanText(q.questionC)} ||| ${cleanText(q.questionD)}`;
  if (!objMap.has(key)) objMap.set(key, []);
  objMap.get(key)!.push(i + 1);
});

objMap.forEach((indices, key) => {
  if (indices.length > 1) {
    console.log(`*** 100% IDENTICAL CQ (${indices.join(", ")}): ***`);
  }
});

console.log("Finished duplicate analysis.");
