import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "raw-data/test-cq.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

console.log("Chapter Title:", data.chapterTitle);
console.log("Total CQs in file:", data.questions.length);

data.questions.forEach((q: any, i: number) => {
  console.log(`\n--- CQ #${i + 1} ---`);
  console.log("Ref:", q.reference);
  console.log("Context snippet:", (q.context || "").replace(/\n/g, " ").slice(0, 60) + "...");
  console.log("A:", q.questionA);
  console.log("B:", q.questionB);
  console.log("C:", q.questionC);
  console.log("D:", q.questionD);
});
