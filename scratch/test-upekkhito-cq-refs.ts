import fs from "fs";
import path from "path";

const filePath = path.resolve(__dirname, "raw-data/test-cq.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

function isQuestionNoReference(ref: string): boolean {
  const trimmed = ref.trim();
  if (trimmed.startsWith("অনন্য প্রশ্ন")) return true;
  if (trimmed.startsWith("প্রশ্ন নং")) return true;
  if (trimmed.startsWith("প্রশ্ন")) return true;
  if (/^\[?cite:/i.test(trimmed)) return true;
  return /^(?:প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+|q(?:uestion)?\s*(?:no\.?)?\s*[-:–.]?\s*\d+)$/i.test(trimmed);
}

function normalizeReferences(rawRefs?: string[]): string[] {
  if (!rawRefs || !Array.isArray(rawRefs)) return [];

  const splitItems = rawRefs.flatMap((item) =>
    typeof item === "string" ? item.split(/[;；|]+|,\s*(?=নি[.\s]*প)/).map((s) => s.trim()) : []
  ).filter(Boolean);

  const normalized = new Set<string>();

  for (const rawItem of splitItems) {
    let item = rawItem
      .replace(/\[cite:\s*[^\]]+\]/gi, "")
      .replace(/\[?\bcite:\s*\d+\b\]?/gi, "")
      .replace(/\s*\|\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .replace(/,\s*প্রশ্ন\s*(?:নং|নম্বর)?\s*[-:–.]?\s*[০-৯0-9]+/gi, "")
      .trim();

    if (!item || isQuestionNoReference(item)) {
      continue;
    }

    const multiYearMatch = item.match(/^(.+?)\s+([০-৯]{4}(?:\s*,\s*[০-৯]{4})+)$/);
    if (multiYearMatch) {
      const prefix = multiYearMatch[1]!.trim();
      const years = multiYearMatch[2]!.split(",").map((y) => y.trim());
      for (const y of years) {
        normalized.add(`${prefix} ${y}`);
      }
    } else {
      normalized.add(item);
    }
  }

  return Array.from(normalized);
}

data.questions.forEach((q: any, i: number) => {
  const clean = normalizeReferences(q.reference);
  console.log(`CQ #${i + 1}: Raw=${JSON.stringify(q.reference)} -> Clean=${JSON.stringify(clean)}`);
});
