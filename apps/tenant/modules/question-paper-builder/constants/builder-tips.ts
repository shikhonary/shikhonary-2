import {
  Scissors,
  BookOpen,
  Columns2,
  Type,
  Maximize2,
  LayoutGrid,
  ListOrdered,
  SeparatorHorizontal,
  MousePointerClick,
  GitFork,
  ScanLine,
  Stamp,
  Keyboard,
  type LucideIcon,
} from "lucide-react";

export type TipCategoryKey =
  | "all"
  | "cost_saving"
  | "layout"
  | "typography"
  | "mcq"
  | "breaks"
  | "editing"
  | "omr_security"
  | "shortcuts";

export interface BuilderTipItem {
  id: string;
  category: TipCategoryKey;
  categoryLabelBn: string;
  categoryBadgeClass: string;
  icon: LucideIcon;
  title: string;
  advice: string;
  actionPath: string;
}

export const BUILDER_TIPS: BuilderTipItem[] = [
  // ── ১. কাগজ সাশ্রয় ও প্রিন্ট লেআউট ─────────────────────────
  {
    id: "half_sheet_duplicate",
    category: "cost_saving",
    categoryLabelBn: "কাগজ সাশ্রয়",
    categoryBadgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: Scissors,
    title: "১ পাতায় ২টি কপি (হাফ-শিট)",
    advice: "স্বল্প নম্বরের বা ১ পৃষ্ঠার প্রশ্নপত্রে কাগজের খরচ ৫০% বাঁচাতে পাশাপাশি ২টি কপি প্রিন্ট করুন; মাঝখানে স্বয়ংক্রিয় কাটার দাগ পড়বে।",
    actionPath: "সাইডবার 'লেআউট' সেটিংস > '১ পাতায় ২টি কপি' টগল অন করুন",
  },
  {
    id: "book_fold_layout",
    category: "cost_saving",
    categoryLabelBn: "বুকলেট লেআউট",
    categoryBadgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: BookOpen,
    title: "বুক ফোল্ড লেআউটে বুকলেট তৈরি",
    advice: "২ বা ৪ পৃষ্ঠার প্রশ্নপত্র বইয়ের মতো মাঝখানে ভাঁজ করে বুকলেট করতে বুক-ফোল্ড ব্যবহার করুন; এতে স্পাইনের ফাঁকা জায়গা (৩০ মিমি) ঠিক থাকে।",
    actionPath: "সাইডবার 'লেআউট' সেটিংস > 'বুক ফোল্ড লেআউট' অন করুন",
  },
  {
    id: "two_columns_density",
    category: "layout",
    categoryLabelBn: "কলাম বিন্যাস",
    categoryBadgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: Columns2,
    title: "২-কলাম মোডে প্রশ্ন বিন্যাস",
    advice: "বড় প্রশ্নপত্রে এক কলামের বদলে ২-কলাম ব্যবহার করলে পৃষ্ঠা সংখ্যা ২৫-৩০% কমে যায় এবং প্রশ্ন ঘন ও আকর্ষণীয় দেখায়।",
    actionPath: "সাইডবার 'লেআউট' সেটিংস > কলাম সংখ্যা '২ কলাম' নির্বাচন করুন",
  },

  // ── ২. টাইপোগ্রাফি ও ফন্ট ─────────────────────────────────
  {
    id: "bangla_font_selection",
    category: "typography",
    categoryLabelBn: "ফন্ট স্টাইল",
    categoryBadgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    icon: Type,
    title: "বাংলা ফন্টের সুস্পষ্টতা",
    advice: "প্রশ্নপত্র মুদ্রণের জন্য 'সোলাইমানলিপি' বা 'কালপুরুষ' সবচেয়ে বেশি মানানসই ও স্পষ্ট। গণিত বা চিহ্নের জন্য আদর্শলিপি ব্যবহার করুন।",
    actionPath: "সাইডবার 'টাইপোগ্রাফি' > ফন্ট ফ্যামিলি ড্রপডাউন থেকে নির্বাচন করুন",
  },
  {
    id: "font_size_balancing",
    category: "typography",
    categoryLabelBn: "পৃষ্ঠা ফিট",
    categoryBadgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Maximize2,
    title: "ফন্ট সাইজ ও পৃষ্ঠা ব্যালেন্স",
    advice: "কোনো প্রশ্ন অল্পের জন্য পরের পৃষ্ঠায় চলে গেলে ফন্ট সাইজ ০.৫pt কমালে বা লাইন স্পেসিং পরিবর্তন করলে এক পৃষ্ঠায় সুন্দরভাবে ফিট হবে।",
    actionPath: "সাইডবার 'টাইপোগ্রাফি' > ফন্ট সাইজের '+' বা '-' চাপুন",
  },

  // ── ৩. MCQ অপশন বিন্যাস ───────────────────────────────────
  {
    id: "mcq_per_question_columns",
    category: "mcq",
    categoryLabelBn: "MCQ বিন্যাস",
    categoryBadgeClass: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
    icon: LayoutGrid,
    title: "প্রতি লাইনে অপশন কলাম পরিবর্তন",
    advice: "ছোট অপশন থাকলে ৪-কলাম এবং বড় বাক্য থাকলে ১ বা ২-কলাম বেছে নিন যাতে অপশনগুলোর মাঝে কোনো ফাঁকা জায়গা নষ্ট না হয়।",
    actionPath: "ক্যানভাসে MCQ প্রশ্নের ডান পাশের টুলবারে '1', '2' বা '4' বাটনে ক্লিক করুন",
  },
  {
    id: "mcq_option_numbering_style",
    category: "mcq",
    categoryLabelBn: "অপশন স্টাইল",
    categoryBadgeClass: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
    icon: ListOrdered,
    title: "MCQ অপশন নাম্বারিং স্টাইল",
    advice: "অপশন নাম্বারিংয়ের জন্য ব্র্যাকেট `(ক)`, ডট `ক.`, কিংবা বৃত্তাকার স্টাইল `ক` থেকে আপনার প্রতিষ্ঠানের মান অনুযায়ী স্টাইল বেছে নিন।",
    actionPath: "সাইডবার 'প্রশ্ন/OMR' > 'MCQ অপশন স্টাইল' থেকে নির্বাচন করুন",
  },

  // ── ৪. পেইজ ব্রেক ও কলাম ব্রেক ────────────────────────────
  {
    id: "page_and_column_breaks",
    category: "breaks",
    categoryLabelBn: "পেইজ ব্রেক",
    categoryBadgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    icon: SeparatorHorizontal,
    title: "প্রশ্ন ভেঙে যাওয়া রোধে পেইজ ব্রেক",
    advice: "উদ্দীপক এক পাতায় আর উপ-প্রশ্ন অন্য পাতায় চলে গেলে প্রশ্নের পূর্বে কলাম বা পেজ ব্রেক দিয়ে পুরো প্রশ্নটিকে একসাথে পরের পাতায় নিন।",
    actionPath: "ক্যানভাসে প্রশ্নের উপরে ব্রেক বাটনে ক্লিক করে 'পেজ ব্রেক' বা 'কলাম ব্রেক' দিন",
  },

  // ── ৫. ইনলাইন এডিটিং ও কাস্টমাইজেশন ───────────────────────
  {
    id: "inline_text_editing",
    category: "editing",
    categoryLabelBn: "ক্যানভাস এডিট",
    categoryBadgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    icon: MousePointerClick,
    title: "ক্যানভাসে সরাসরি টেক্সট এডিট",
    advice: "হেডারের যেকোনো তথ্য (যেমন: সময়, পূর্ণমান, নির্দেশনা) বা প্রশ্নে সরাসরি ক্লিক করে বানান সংশোধন ও বোল্ড/ইটালিক করতে পারেন।",
    actionPath: "ক্যানভাসে লেখার ওপর ক্লিক করুন এবং ফ্লোটিং ফরম্যাট টুলবার ব্যবহার করুন",
  },
  {
    id: "alternative_questions",
    category: "editing",
    categoryLabelBn: "অথবা প্রশ্ন",
    categoryBadgeClass: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
    icon: GitFork,
    title: "বিকল্প বা 'অথবা' প্রশ্ন যুক্ত করা",
    advice: "যেকোনো বর্ণনামূলক, গণিত বা ব্যাকরণ প্রশ্নে শিক্ষার্থীদের অতিরিক্ত বিকল্প দিতে সরাসরি 'অথবা' প্রশ্ন যোগ করতে পারেন।",
    actionPath: "প্রশ্নের ডান পাশের অ্যাকশন মেন্যু থেকে 'অথবা প্রশ্ন যোগ করুন' সিলেক্ট করুন",
  },

  // ── ৬. OMR ও সিকিউরিটি ────────────────────────────────────
  {
    id: "automated_omr_sheet",
    category: "omr_security",
    categoryLabelBn: "OMR শিট",
    categoryBadgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    icon: ScanLine,
    title: "স্বয়ংক্রিয় OMR শিট জেনারেশন",
    advice: "নৈর্ব্যক্তিক পরীক্ষার জন্য আলাদা ওএমআর তৈরির প্রয়োজন নেই; প্রশ্নপত্রের সাথেই স্বয়ংক্রিয়ভাবে ২, ৩ বা ৪ কলামের ওএমআর শিট যুক্ত করা যায়।",
    actionPath: "সাইডবার 'প্রশ্ন/OMR' > 'OMR শিট যুক্ত করুন' টগল অন করুন",
  },
  {
    id: "logo_and_watermark_security",
    category: "omr_security",
    categoryLabelBn: "সুরক্ষা ও ব্র্যান্ডিং",
    categoryBadgeClass: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    icon: Stamp,
    title: "লোগো ও ওয়াটারমার্ক সুরক্ষা",
    advice: "প্রশ্নপত্র যাতে অন্য কেউ নকল বা অপব্যবহার না করতে পারে সেজন্য প্রতিষ্ঠানের লোগো ও হালকা ব্যাকগ্রাউন্ড ওয়াটারমার্ক যুক্ত করুন।",
    actionPath: "সাইডবার 'হেডার' > 'ব্র্যান্ডিং ও ওয়াটারমার্ক' অপশন চালু করুন",
  },

  // ── ৭. কিবোর্ড শর্টকাট ────────────────────────────────────
  {
    id: "productivity_shortcuts",
    category: "shortcuts",
    categoryLabelBn: "কিবোর্ড শর্টকাট",
    categoryBadgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    icon: Keyboard,
    title: "কিবোর্ডেই দ্রুত সেভ ও আনডু",
    advice: "কাজ করার সময় মাউস না ধরে কিবোর্ড শর্টকাটে দ্রুত কাজ সম্পন্ন করুন: সেভ করতে Ctrl+S, পূর্বাবস্থায় ফিরতে Ctrl+Z ব্যবহার করুন।",
    actionPath: "Ctrl + S (সেভ) | Ctrl + Z (আনডু) | Ctrl + Y (রিডু)",
  },
];
