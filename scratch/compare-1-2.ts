import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "raw-data/test-cq.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

console.log("CQ #1 Context:\n", data.questions[0].context);
console.log("\nCQ #2 Context:\n", data.questions[1].context);
console.log("\nAre contexts equal?", data.questions[0].context === data.questions[1].context);
