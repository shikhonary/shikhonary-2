import { create } from "zustand";
import { PaperItem, PaperSettings, MCQItem, CQItem, PaperHeaderItem, ElementStyle, PaperBlock } from "../types";

interface BuilderState {
  paperId: string | null;
  items: PaperItem[];
  settings: PaperSettings;
  
  // UI State
  zoom: number | "auto";
  selectedItemId: string | null;
  calculatedBlocks: PaperBlock[];
  isExporting: boolean;
  saveStatus: "idle" | "saving" | "saved" | "error";
  hasUnsavedChanges: boolean;

  // Actions
  setPaperId: (id: string) => void;
  setItems: (items: PaperItem[]) => void;
  updateItem: (id: string, updates: Partial<PaperItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (oldIndex: number, newIndex: number) => void;
  
  updateSettings: (updates: Partial<PaperSettings>) => void;
  
  setZoom: (zoom: number | "auto") => void;
  setSelectedItemId: (id: string | null) => void;
  setIsExporting: (isExporting: boolean) => void;
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  markSaved: () => void;
  setMcqOptionLayout: (id: string, columns: number) => void;
  setItemStyle: (key: string, style: Partial<ElementStyle>) => void;
  setItemText: (key: string, text: string) => void;
  setOMRSetting: (key: keyof PaperSettings["omrSettings"], value: any) => void;
  toggleOMRSheet: (show: boolean) => void;
  setBlockBreak: (id: string, type: "page" | "column" | "none") => void;
  
  // Hydration
  hydratePaper: (id: string, settings: Partial<PaperSettings>, paperData?: any) => void;
}

const defaultSettings: PaperSettings = {
  paperSize: "A4",
  paperOrientation: "portrait",
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  columns: 1,
  showColumnDivider: false,
  bookletMode: false,
  headerTemplate: "modern",
  optionStyle: "circle",
  fontFamily: "SolaimanLipi",
  fontSize: 12,
  fontWeight: "normal",
  lineHeight: 1.5,
  textAlign: "left",
  showLogo: false,
  showAddress: false,
  showWatermark: false,
  showClassName: true,
  showSubjectName: true,
  showChapterName: false,
  showSetCode: false,
  showExamName: true,
  showTime: true,
  showTotalMarks: true,
  showInstructions: true,
  showNoMarkingNote: false,
  showReference: false,

  // OMR defaults
  showOMRSheet: false,
  omrSettings: {
    columns: 3,
    includeRollNumber: true,
  },

  institutionName: "শিখনারী একাডেমি",
  className: "দশম শ্রেণি",
  subjectName: "পদার্থবিজ্ঞান",
  chapterName: "অধ্যায় ১",
  setCode: "ক",
  examName: "অর্ধ-বার্ষিক পরীক্ষা - ২০২৬",
  time: "২ ঘন্টা ৩০ মিনিট",
  totalMarks: "৫০",
  instructions: "সবগুলো প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান সমান।",
};

export const useBuilderStore = create<BuilderState>((set) => ({
  paperId: null,
  items: [],
  settings: defaultSettings,
  
  zoom: "auto",
  selectedItemId: null,
  calculatedBlocks: [],
  isExporting: false,
  saveStatus: "idle",
  hasUnsavedChanges: false,

  setPaperId: (id) => set({ paperId: id }),
  
  setItems: (items) => set({ items, hasUnsavedChanges: true }),
  
  updateItem: (id, updates) => set((state) => ({
    items: state.items.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates } as PaperItem;
      }
      return item;
    }),
    hasUnsavedChanges: true,
  })),
  
  deleteItem: (id) => set((state) => ({
    items: state.items.filter((item) => item.id !== id),
    hasUnsavedChanges: true,
    selectedItemId: state.selectedItemId === id ? null : state.selectedItemId,
  })),
  
  reorderItems: (oldIndex, newIndex) => set((state) => {
    const newItems = [...state.items];
    const [removed] = newItems.splice(oldIndex, 1);
    if (removed) {
      newItems.splice(newIndex, 0, removed);
    }
    // Update orderIndex
    const reordered = newItems.map((item, idx) => ({ ...item, orderIndex: idx }));
    return { items: reordered as PaperItem[], hasUnsavedChanges: true };
  }),
  
  updateSettings: (updates) => set((state) => ({
    settings: { ...state.settings, ...updates },
    hasUnsavedChanges: true,
  })),
  
  setZoom: (zoom) => set({ zoom }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  markSaved: () => set({ hasUnsavedChanges: false, saveStatus: "saved" }),
  
  setMcqOptionLayout: (id, columns) => set((state) => ({
    settings: {
      ...state.settings,
      mcqOptionLayouts: {
        ...(state.settings.mcqOptionLayouts || {}),
        [id]: columns
      }
    },
    hasUnsavedChanges: true,
  })),

  setBlockBreak: (id, type) => set((state) => ({
    settings: {
      ...state.settings,
      blockBreaks: {
        ...(state.settings.blockBreaks || {}),
        [id]: type
      }
    },
    hasUnsavedChanges: true,
  })),

  setItemStyle: (key, style) => set((state) => ({
    settings: {
      ...state.settings,
      itemStyles: {
        ...(state.settings.itemStyles || {}),
        [key]: {
          ...(state.settings.itemStyles?.[key] || {}),
          ...style
        }
      }
    },
    hasUnsavedChanges: true,
  })),
  setItemText: (key, text) => set((state) => ({
    settings: {
      ...state.settings,
      itemTexts: {
        ...(state.settings.itemTexts || {}),
        [key]: text
      }
    },
    hasUnsavedChanges: true,
  })),

  toggleOMRSheet: (show) => set((state) => ({
    settings: { ...state.settings, showOMRSheet: show },
    hasUnsavedChanges: true,
  })),

  setOMRSetting: (key, value) => set((state) => ({
    settings: {
      ...state.settings,
      omrSettings: {
        ...(state.settings.omrSettings || defaultSettings.omrSettings),
        [key]: value
      }
    },
    hasUnsavedChanges: true,
  })),
  
  hydratePaper: (id, dbSettings, paperData) => set((state) => {
    // If items are present in the JSON (e.g. for generated sets), load them overriding relational data
    const overrideItems = (dbSettings as any)?.items;
    
    const dynamicDefaults = { ...defaultSettings };
    if (paperData) {
      if (paperData.title) dynamicDefaults.examName = paperData.title;
      if (paperData.academicClass?.nameBn || paperData.academicClass?.nameEn) {
        dynamicDefaults.className = paperData.academicClass.nameBn || paperData.academicClass.nameEn;
      }
      if (paperData.subjects?.length > 0) {
        dynamicDefaults.subjectName = paperData.subjects.map((s: any) => s.subject?.nameBn || s.subject?.nameEn).join(", ");
      }
      
      const englishToBengali: Record<string, string> = {
        '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
        '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
      };
      const toBn = (num: number | string) => num.toString().replace(/\d/g, match => englishToBengali[match] || match);

      if (paperData.timeInMinutes) {
        const hrs = Math.floor(paperData.timeInMinutes / 60);
        const mins = paperData.timeInMinutes % 60;
        let timeStr = "";
        if (hrs > 0) timeStr += `${toBn(hrs)} ঘণ্টা `;
        if (mins > 0) timeStr += `${toBn(mins)} মিনিট`;
        dynamicDefaults.time = timeStr.trim();
      }
      
      if (paperData.total) {
        dynamicDefaults.totalMarks = toBn(paperData.total);
      }
    }

    const finalSettings = { ...dynamicDefaults };
    if (dbSettings && typeof dbSettings === 'object') {
      Object.keys(dbSettings).forEach(k => {
        if ((dbSettings as any)[k] !== undefined) {
          (finalSettings as any)[k] = (dbSettings as any)[k];
        }
      });
    }

    return {
      paperId: id,
      settings: finalSettings,
      items: overrideItems ? overrideItems : state.items,
      hasUnsavedChanges: false,
      saveStatus: "idle",
    };
  }),
}));
