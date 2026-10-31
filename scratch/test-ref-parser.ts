import { readFileSync } from "node:fs";

const data = JSON.parse(readFileSync("scratch/raw-data/test-mcq.json", "utf8"));
const allRefs: string[] = [];
data.questions.forEach((q: any) => {
  if (q.reference && q.reference.length) {
    allRefs.push(...q.reference);
  }
});

console.log("Unique raw references:", [...new Set(allRefs)]);

/**
 * Parses and splits complex references.
 * Examples:
 * 1) "চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়; নি. প. ২০২৫"
 *    -> ["চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়", "নি. প. ২০২৫"]
 * 
 * 2) "ইস্পাহানি পাবলিক স্কুল এন্ড কলেজ, চট্টগ্রাম; এস ও এস হারম্যান মেইনার কলেজ, ঢাকা; নি. প. ২০২৫"
 *    -> ["ইস্পাহানি পাবলিক স্কুল এন্ড কলেজ, চট্টগ্রাম", "এস ও এস হারম্যান মেইনার কলেজ, ঢাকা", "নি. প. ২০২৫"]
 * 
 * 3) "নি. প. ২০২৫, ২০২৪" or "দি. বো. ২৩, ২২"
 *    -> ["নি. প. ২০২৫", "নি. প. ২০২৪"] or ["দি. বো. ২৩", "দি. বো. ২২"]
 * 
 * 4) "ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, রংপুর; বাংলাদেশ মহিলা সমিতি বালিকা উচ্চ বিদ্যালয় ও কলেজ, চট্টগ্রাম; নি. প. ২০২৫, ২০২৪"
 *    -> ["ক্যান্টনমেন্ট পাবলিক স্কুল ও কলেজ, রংপুর", "বাংলাদেশ মহিলা সমিতি বালিকা উচ্চ বিদ্যালয় ও কলেজ, চট্টগ্রাম", "নি. প. ২০২৫", "নি. প. ২০২৪"]
 */
export function normalizeReferences(rawList: string[]): string[] {
  const result: string[] = [];

  for (const raw of rawList) {
    if (!raw || typeof raw !== "string") continue;

    // 1. Split by semicolon ';'
    const semiParts = raw.split(";").map(s => s.trim()).filter(Boolean);

    for (const part of semiParts) {
      // 2. Check if part is an exam/board prefix with multiple years separated by commas
      // e.g. "নি. প. ২০২৫, ২০২৪" or "নি. প. ২০২৫, ২০২৪, ২০২৩" or "দি. বো. ২৩, ২২" or "ঢা. বো. ২০, ১৯"
      // Match pattern like: (Prefix with letters and dots) (Year1), (Year2)...
      const multiYearMatch = part.match(/^([\u0980-\u09FF\w\.\s]+?)\s+([০-৯\d]{2,4}(?:\s*,\s*[০-৯\d]{2,4})+)$/);
      
      if (multiYearMatch) {
        const prefix = multiYearMatch[1]!.trim();
        const yearsStr = multiYearMatch[2]!;
        const years = yearsStr.split(",").map(y => y.trim()).filter(Boolean);

        for (const yr of years) {
          result.push(`${prefix} ${yr}`);
        }
      } else {
        result.push(part);
      }
    }
  }

  // Remove duplicates and empty items
  return [...new Set(result)];
}

console.log("\n--- Normalized Output Test ---");
const uniqueRaw = [...new Set(allRefs)];
uniqueRaw.forEach(r => {
  console.log(`Original: "${r}"`);
  console.log(`Result:  `, normalizeReferences([r]));
  console.log("");
});

// Also test hypothetical multi-year strings:
console.log("Hypothetical test 1: 'চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়; নি. প. ২০২৫, ২০২৪'");
console.log(normalizeReferences(["চট্টগ্রাম সরকারি উচ্চ বিদ্যালয়; নি. প. ২০২৫, ২০২৪"]));

console.log("Hypothetical test 2: 'দি. বো. ২৩, ২২, ২১'");
console.log(normalizeReferences(["দি. বো. ২৩, ২২, ২১"]));
