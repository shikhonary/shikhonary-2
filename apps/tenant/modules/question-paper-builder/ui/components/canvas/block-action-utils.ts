export const getQuestionCategoryFromBlockType = (type: string, data?: any): string => {
  if (type === "question-mcq" || type === "question-correct-answer") return "MCQ";
  if (type === "question-cq") return "CQ";
  if (type === "question-cs") return "CS";
  if (type === "question-short") return "SHORT";
  if (type === "question-paragraph") return "PARAGRAPH";
  if (type === "question-essay") return "ESSAY";
  if (type === "question-summary") return "SUMMARY";
  if (type === "question-essence") return "ESSENCE";
  if (type === "question-poem" || type === "question-poem-essence") return "POEM_ESSENCE";
  if (type === "question-prose-essence") return "PROSE_ESSENCE";
  if (type === "question-amplification") return "AMPLIFICATION";
  if (type === "question-letter") return "LETTER";
  if (type === "question-application") return "APPLICATION";
  if (type === "question-news-report") return "NEWS_REPORT";
  if (type === "question-pbq") return "PBQ";
  if (type === "question-dan-bam-milkoron") return "DAN_BAM_MILKORON";
  if (type === "question-descriptive-question") return "DESCRIPTIVE_QUESTION";
  if (type === "question-short-question") return "SHORT_QUESTION";
  if (type === "question-shuddho-ashuddho") return "SHUDDHO_ASHUDDHO";
  if (type === "question-rearrange") return "REARRANGE";
  if (type === "question-seen-comprehension") return data?.comprehensionType || "SEEN_COMPREHENSION_1";
  return data?.category || type.replace("question-", "").toUpperCase();
};

export const getQuestionTypeBengaliName = (category: string): string => {
  switch (category) {
    case "MCQ": return "বহুনির্বাচনি প্রশ্ন";
    case "CQ": return "সৃজনশীল প্রশ্ন";
    case "CS": return "কেস স্টাডি / সিনারিও প্রশ্ন";
    case "SHORT":
    case "SA": return "সংক্ষিপ্ত উত্তর প্রশ্ন";
    case "PARAGRAPH": return "অনুচ্ছেদ (Paragraph)";
    case "ESSAY": return "প্রবন্ধ / রচনা";
    case "SUMMARY": return "সারাংশ / সারমর্ম";
    case "ESSENCE": return "ভাবসম্প্রসারণ / মূলভাব";
    case "AMPLIFICATION": return "ভাবসম্প্রসারণ";
    case "LETTER": return "চিঠি / পত্র লিখন";
    case "APPLICATION": return "আবেদনপত্র";
    case "NEWS_REPORT": return "সংবাদ প্রতিবেদন";
    case "DAN_BAM_MILKORON": return "ডান-বাম মিলকরণ";
    case "REARRANGE": return "পুনর্বিন্যাস (Rearrange)";
    default: return "প্রশ্ন";
  }
};
