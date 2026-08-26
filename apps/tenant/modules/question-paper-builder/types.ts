export interface ElementStyle {
  fontSize?: number;
  fontFamily?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontWeight?: string | number;
}

export type PaperItemType = "MCQ" | "CQ" | "HEADER";

export interface BasePaperItem {
  id: string;
  type: PaperItemType;
  orderIndex: number;
}

export interface HeaderStyles {
  institutionName?: ElementStyle;
  className?: ElementStyle;
  subjectName?: ElementStyle;
  chapterName?: ElementStyle;
  setCode?: ElementStyle;
  examName?: ElementStyle;
  time?: ElementStyle;
  totalMarks?: ElementStyle;
  instructions?: ElementStyle;
}

export interface PaperHeaderItem extends BasePaperItem {
  type: "HEADER";
  institutionName: string;
  showClassName: boolean;
  className: string;
  showSubjectName: boolean;
  subjectName: string;
  showExamName: boolean;
  examName: string;
  showInstructions: boolean;
  instructions: string;
  showTime: boolean;
  time: string;
  showTotalMarks: boolean;
  totalMarks: number;
  showSetCode: boolean;
  setCode: string;
  styles: HeaderStyles;
}

export interface MCQOption {
  label: string;
  text: string;
  style?: ElementStyle;
}

export interface MCQItem extends BasePaperItem {
  type: "MCQ";
  number: number;
  question: string;
  questionStyle?: ElementStyle;
  options: MCQOption[];
  correctAnswer?: string;
  context?: string;
  contextStyle?: ElementStyle;
  statements?: string[];
  statementStyles?: ElementStyle[];
  optionsColumns?: 1 | 2;
  mcqType: "single" | "multiple" | "contextual";
}

export interface CQSubQuestion {
  label: string;
  text: string;
  marks: number;
  style?: ElementStyle;
}

export interface CQItem extends BasePaperItem {
  type: "CQ";
  number: number;
  question: string;
  questionStyle?: ElementStyle;
  context?: string;
  contextStyle?: ElementStyle;
  subQuestions: CQSubQuestion[];
}

export type PaperItem = PaperHeaderItem | MCQItem | CQItem;

export interface MarginSettings {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface PaperSettings {
  paperSize: "A4" | "Letter" | "Legal" | "A5";
  paperOrientation: "portrait" | "landscape";
  margins: MarginSettings;
  columns: 1 | 2 | 3;
  showColumnDivider: boolean;
  bookletMode: boolean;

  headerTemplate: "classic" | "modern" | "minimal" | "left-aligned";

  optionStyle: "parentheses" | "dot" | "circle" | "round";
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "medium" | "semibold" | "bold";
  lineHeight: number;
  textAlign: "left" | "center" | "right" | "justify";

  showLogo: boolean;
  logoUrl?: string;
  showAddress: boolean;
  address?: string;
  showWatermark: boolean;
  watermark?: string;

  // Header Visibility
  showClassName: boolean;
  showSubjectName: boolean;
  showChapterName: boolean;
  showSetCode: boolean;
  showExamName: boolean;
  showTime: boolean;
  showTotalMarks: boolean;
  showInstructions: boolean;
  showNoMarkingNote: boolean;
  showReference: boolean;
  blocks?: PaperBlock[];
  blockBreaks?: Record<string, "page" | "column" | "none">;

  // Header Texts
  institutionName: string;
  className: string;
  subjectName: string;
  chapterName: string;
  setCode: string;
  examName: string;
  time: string;
  totalMarks: string | number;
  instructions: string;

  mcqOptionLayouts?: Record<string, number>;
  mcqOptionColumns?: 1 | 2 | 4;
  itemStyles?: Record<string, ElementStyle>;
  itemTexts?: Record<string, string>;

  // OMR Settings
  showOMRSheet: boolean;
  omrSettings: {
    columns: 2 | 3 | 4;
    includeRollNumber: boolean;
  };
}

export interface PaperBlock {
  id: string;
  type: string;
  data: any;
  gap?: number;
}
