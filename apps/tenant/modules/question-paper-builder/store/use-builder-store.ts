import { create } from "zustand";
import { toast } from "@workspace/ui/components/sonner";
import { PaperItem, PaperSettings, MCQItem, CQItem, PaperHeaderItem, ElementStyle, PaperBlock, BlockBreakType } from "../types";

export interface HistorySnapshot {
  settings: PaperSettings;
  dismissedSectionIds: string[];
  dismissedSubSectionIds: string[];
}

export interface HistoryEntry {
  description?: string;
  undo: () => void | Promise<void>;
  redo: () => void | Promise<void>;
}

interface BuilderState {
  paperId: string | null;
  paperStatus: string | null;
  isPublished: boolean;
  items: PaperItem[];
  settings: PaperSettings;
  
  // UI State
  zoom: number | "auto";
  effectiveZoom: number;
  pageCount: number;
  selectedItemId: string | null;
  calculatedBlocks: PaperBlock[];
  isExporting: boolean;
  exportProgress: { current: number; total: number } | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  hasUnsavedChanges: boolean;

  // Active section & subsection target for Question Picker
  activeSectionId: string | null;
  activeSubSectionId: string | null;
  dismissedSectionIds: string[];
  dismissedSubSectionIds: string[];

  // Actions
  setPaperId: (id: string) => void;
  setPaperStatus: (status: string) => void;
  setIsPublished: (isPublished: boolean) => void;
  setItems: (items: PaperItem[]) => void;
  updateItem: (id: string, updates: Partial<PaperItem>) => void;
  deleteItem: (id: string) => void;
  reorderItems: (oldIndex: number, newIndex: number) => void;
  
  setActiveTarget: (target: { sectionId?: string | null; subSectionId?: string | null }) => void;
  dismissSection: (sectionId: string) => void;
  dismissSubSection: (subSectionId: string) => void;
  restoreSection: (sectionId: string) => void;
  restoreSubSection: (subSectionId: string) => void;
  
  updateSettings: (updates: Partial<PaperSettings>) => void;
  applyRemoteSettings: (updates: Partial<PaperSettings>) => void;
  requestRehydrate: () => void;
  rehydrateCounter: number;
  highlightedItemIds: string[];
  flashHighlightItem: (idOrIds: string | string[]) => void;
  
  setZoom: (zoom: number | "auto") => void;
  setEffectiveZoom: (effectiveZoom: number) => void;
  setPageCount: (count: number) => void;
  setSelectedItemId: (id: string | null) => void;
  setIsExporting: (isExporting: boolean) => void;
  setExportProgress: (progress: { current: number; total: number } | null) => void;
  setSaveStatus: (status: "idle" | "saving" | "saved" | "error") => void;
  markSaved: () => void;
  setMcqOptionLayout: (id: string, columns: number) => void;
  setMcqStatementLayout: (id: string, columns: number) => void;
  setItemStyle: (key: string, style: Partial<ElementStyle>) => void;
  setItemText: (key: string, text: string) => void;
  setOMRSetting: (key: keyof PaperSettings["omrSettings"], value: any) => void;
  toggleOMRSheet: (show: boolean) => void;
  setBlockBreak: (id: string, type: BlockBreakType) => void;
  
  // History (Undo / Redo)
  past: HistoryEntry[];
  future: HistoryEntry[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  pushHistoryEntry: (entry: HistoryEntry) => void;
  
  // Hydration
  hydratePaper: (id: string, settings: Partial<PaperSettings>, paperData?: any, tenantNameBn?: string | null) => void;
}

const defaultSettings: PaperSettings = {
  paperSize: "A4",
  paperOrientation: "portrait",
  margins: { top: 20, bottom: 20, left: 20, right: 20 },
  columns: 1,
  columnGap: 12,
  showColumnDivider: false,
  bookletMode: false,
  bookFoldLayout: false,
  duplicateSinglePage: false,
  headerTemplate: "modern",
  optionStyle: "circle",
  isAnswerMode: false,
  fontFamily: "SolaimanLipi",
  fontSize: 15,
  fontWeight: "normal",
  lineHeight: 1.5,
  textAlign: "left",
  showLogo: false,
  showAddress: false,
  showWatermark: false,
  showAppBranding: true,
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

  mcqStatementColumns: 1,

  institutionName: "শিখনারী একাডেমি",
  className: "দশম শ্রেণি",
  subjectName: "পদার্থবিজ্ঞান",
  chapterName: "অধ্যায় ১",
  setCode: "ক",
  examName: "অর্ধ-বার্ষিক পরীক্ষা - ২০২৬",
  time: "২ ঘন্টা ৩০ মিনিট",
  totalMarks: "৫০",
  instructions: "সবগুলো প্রশ্নের উত্তর দাও। প্রতিটি প্রশ্নের মান সমান।",
  dismissedSectionIds: [],
  dismissedSubSectionIds: [],
  hiddenSectionTitleIds: [],
  hiddenSectionInstructionIds: [],
};

const MAX_HISTORY = 30;

const createSnapshot = (state: {
  settings: PaperSettings;
  dismissedSectionIds?: string[];
  dismissedSubSectionIds?: string[];
}): HistorySnapshot => ({
  settings: JSON.parse(JSON.stringify(state.settings || defaultSettings)),
  dismissedSectionIds: [...(state.dismissedSectionIds || [])],
  dismissedSubSectionIds: [...(state.dismissedSubSectionIds || [])],
});

export const useBuilderStore = create<BuilderState>((set, get) => {
  const recordSettingsChange = (
    description: string,
    applyNext: (currentSettings: PaperSettings, state: BuilderState) => {
      settings: PaperSettings;
      dismissedSectionIds?: string[];
      dismissedSubSectionIds?: string[];
    }
  ) => {
    const state = get();
    const prevSnapshot = createSnapshot(state);

    const result = applyNext(state.settings, state);
    const nextSettings = result.settings;
    const nextSnapshot: HistorySnapshot = {
      settings: JSON.parse(JSON.stringify(nextSettings)),
      dismissedSectionIds: result.dismissedSectionIds ? [...result.dismissedSectionIds] : [...state.dismissedSectionIds],
      dismissedSubSectionIds: result.dismissedSubSectionIds ? [...result.dismissedSubSectionIds] : [...state.dismissedSubSectionIds],
    };

    const entry: HistoryEntry = {
      description,
      undo: () => set({
        settings: prevSnapshot.settings,
        dismissedSectionIds: prevSnapshot.dismissedSectionIds,
        dismissedSubSectionIds: prevSnapshot.dismissedSubSectionIds,
        hasUnsavedChanges: true,
      }),
      redo: () => set({
        settings: nextSnapshot.settings,
        dismissedSectionIds: nextSnapshot.dismissedSectionIds,
        dismissedSubSectionIds: nextSnapshot.dismissedSubSectionIds,
        hasUnsavedChanges: true,
      }),
    };

    const newPast = [...state.past, entry].slice(-MAX_HISTORY);

    set({
      settings: nextSettings,
      dismissedSectionIds: nextSnapshot.dismissedSectionIds,
      dismissedSubSectionIds: nextSnapshot.dismissedSubSectionIds,
      hasUnsavedChanges: true,
      past: newPast,
      future: [],
      canUndo: true,
      canRedo: false,
    });
  };

  return {
  paperId: null,
  paperStatus: null,
  isPublished: false,
  items: [],
  settings: defaultSettings,

  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  pushHistoryEntry: (entry) => set((state) => {
    const newPast = [...state.past, entry].slice(-MAX_HISTORY);
    return {
      past: newPast,
      future: [],
      canUndo: newPast.length > 0,
      canRedo: false,
    };
  }),

  undo: async () => {
    const { past, future } = get();
    if (past.length === 0) {
      toast.info("পূর্বাবস্থায় নেওয়ার মতো কোনো পরিবর্তন নেই");
      return;
    }
    const entry = past[past.length - 1];
    if (!entry) return;
    const newPast = past.slice(0, -1);
    const newFuture = [entry, ...future];
    set({
      past: newPast,
      future: newFuture,
      canUndo: newPast.length > 0,
      canRedo: true,
    });
    try {
      await entry.undo();
      toast.info(entry.description ? `${entry.description}: পূর্বাবস্থায় নেওয়া হয়েছে` : "পূর্বাবস্থায় নেওয়া হয়েছে");
    } catch (err: any) {
      toast.error(err?.message || "পূর্বাবস্থায় ফেরানো যায়নি");
    }
  },

  redo: async () => {
    const { past, future } = get();
    if (future.length === 0) {
      toast.info("পুনরায় করার মতো কোনো পরিবর্তন নেই");
      return;
    }
    const entry = future[0];
    if (!entry) return;
    const newFuture = future.slice(1);
    const newPast = [...past, entry];
    set({
      past: newPast,
      future: newFuture,
      canUndo: true,
      canRedo: newFuture.length > 0,
    });
    try {
      await entry.redo();
      toast.info(entry.description ? `${entry.description}: পুনরায় প্রয়োগ করা হয়েছে` : "পুনরায় প্রয়োগ করা হয়েছে");
    } catch (err: any) {
      toast.error(err?.message || "পুনরায় প্রয়োগ করা যায়নি");
    }
  },
  
  zoom: "auto",
  effectiveZoom: 1,
  pageCount: 1,
  selectedItemId: null,
  calculatedBlocks: [],
  isExporting: false,
  exportProgress: null,
  saveStatus: "idle",
  hasUnsavedChanges: false,

  activeSectionId: null,
  activeSubSectionId: null,
  dismissedSectionIds: [],
  dismissedSubSectionIds: [],
  hiddenSectionTitleIds: [],
  hiddenSectionInstructionIds: [],

  setActiveTarget: (target) => set((state) => ({
    activeSectionId: target.sectionId !== undefined ? target.sectionId : state.activeSectionId,
    activeSubSectionId: target.subSectionId !== undefined ? target.subSectionId : state.activeSubSectionId,
  })),

  dismissSection: (sectionId) => {
    const state = get();
    const nextDismissed = Array.from(new Set([...(state.settings.dismissedSectionIds || state.dismissedSectionIds || []), sectionId]));
    recordSettingsChange("সেকশন বাতিল", (curr) => ({
      settings: { ...curr, dismissedSectionIds: nextDismissed },
      dismissedSectionIds: nextDismissed,
    }));
    set({
      activeSectionId: state.activeSectionId === sectionId ? null : state.activeSectionId,
      activeSubSectionId: state.activeSectionId === sectionId ? null : state.activeSubSectionId,
    });
  },

  dismissSubSection: (subSectionId) => {
    const state = get();
    const nextDismissed = Array.from(new Set([...(state.settings.dismissedSubSectionIds || state.dismissedSubSectionIds || []), subSectionId]));
    recordSettingsChange("সাব-সেকশন বাতিল", (curr) => ({
      settings: { ...curr, dismissedSubSectionIds: nextDismissed },
      dismissedSubSectionIds: nextDismissed,
    }));
    set({
      activeSubSectionId: state.activeSubSectionId === subSectionId ? null : state.activeSubSectionId,
    });
  },

  restoreSection: (sectionId) => {
    const state = get();
    const nextDismissed = (state.settings.dismissedSectionIds || state.dismissedSectionIds || []).filter((id) => id !== sectionId);
    recordSettingsChange("সেকশন পুনরুদ্ধার", (curr) => ({
      settings: { ...curr, dismissedSectionIds: nextDismissed },
      dismissedSectionIds: nextDismissed,
    }));
  },

  restoreSubSection: (subSectionId) => {
    const state = get();
    const nextDismissed = (state.settings.dismissedSubSectionIds || state.dismissedSubSectionIds || []).filter((id) => id !== subSectionId);
    recordSettingsChange("সাব-সেকশন পুনরুদ্ধার", (curr) => ({
      settings: { ...curr, dismissedSubSectionIds: nextDismissed },
      dismissedSubSectionIds: nextDismissed,
    }));
  },

  setPaperId: (id) => set({ paperId: id }),
  setPaperStatus: (status) => set({ paperStatus: status, isPublished: status === "Published" }),
  setIsPublished: (isPublished) => set({ isPublished }),
  
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
  
  updateSettings: (updates) => {
    const finalUpdates = { ...updates };
    if (updates.duplicateSinglePage) {
      finalUpdates.bookFoldLayout = false;
    } else if (updates.bookFoldLayout) {
      finalUpdates.duplicateSinglePage = false;
    }
    recordSettingsChange("সেটিংস পরিবর্তন", (curr) => ({
      settings: { ...curr, ...finalUpdates },
    }));
  },

  applyRemoteSettings: (updates) => set((state) => {
    const finalUpdates = { ...updates };
    if (updates.duplicateSinglePage) {
      finalUpdates.bookFoldLayout = false;
    } else if (updates.bookFoldLayout) {
      finalUpdates.duplicateSinglePage = false;
    }
    return {
      settings: { ...state.settings, ...finalUpdates },
      hasUnsavedChanges: false,
    };
  }),

  rehydrateCounter: 0,
  requestRehydrate: () => set((state) => ({ rehydrateCounter: state.rehydrateCounter + 1 })),
  
  highlightedItemIds: [],
  flashHighlightItem: (idOrIds) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    set((state) => ({
      highlightedItemIds: Array.from(new Set([...state.highlightedItemIds, ...ids])),
    }));
    setTimeout(() => {
      set((state) => ({
        highlightedItemIds: state.highlightedItemIds.filter((id) => !ids.includes(id)),
      }));
    }, 3500);
  },

  setZoom: (zoom) => set({ zoom }),
  setEffectiveZoom: (effectiveZoom) => set({ effectiveZoom }),
  setPageCount: (pageCount) => set({ pageCount }),
  setSelectedItemId: (id) => set({ selectedItemId: id }),
  setIsExporting: (isExporting) => set({ isExporting }),
  setExportProgress: (exportProgress) => set({ exportProgress }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  markSaved: () => set({ hasUnsavedChanges: false, saveStatus: "saved" }),
  
  setMcqOptionLayout: (id, columns) => {
    recordSettingsChange("অপশন লেআউট পরিবর্তন", (curr) => ({
      settings: {
        ...curr,
        mcqOptionLayouts: {
          ...(curr.mcqOptionLayouts || {}),
          [id]: columns,
        },
      },
    }));
  },

  setMcqStatementLayout: (id, columns) => {
    recordSettingsChange("স্টেটমেন্ট লেআউট পরিবর্তন", (curr) => ({
      settings: {
        ...curr,
        mcqStatementLayouts: {
          ...(curr.mcqStatementLayouts || {}),
          [id]: columns,
        },
      },
    }));
  },

  setBlockBreak: (id, type) => {
    const desc = type === "none" ? "ব্রেক বাতিল" : type.includes("page") ? "পেজ ব্রেক" : "কলাম ব্রেক";
    recordSettingsChange(desc, (curr) => ({
      settings: {
        ...curr,
        blockBreaks: {
          ...(curr.blockBreaks || {}),
          [id]: type,
        },
      },
    }));
  },

  setItemStyle: (key, style) => {
    recordSettingsChange("স্টাইল পরিবর্তন", (curr) => ({
      settings: {
        ...curr,
        itemStyles: {
          ...(curr.itemStyles || {}),
          [key]: {
            ...(curr.itemStyles?.[key] || {}),
            ...style,
          },
        },
      },
    }));
  },

  setItemText: (key, text) => {
    recordSettingsChange("টেক্সট সম্পাদনা", (curr) => ({
      settings: {
        ...curr,
        itemTexts: {
          ...(curr.itemTexts || {}),
          [key]: text,
        },
      },
    }));
  },

  toggleOMRSheet: (show) => {
    recordSettingsChange(show ? "OMR শীট যুক্ত" : "OMR শীট বাতিল", (curr) => ({
      settings: { ...curr, showOMRSheet: show },
    }));
  },

  setOMRSetting: (key, value) => {
    recordSettingsChange("OMR সেটিংস", (curr) => ({
      settings: {
        ...curr,
        omrSettings: {
          ...(curr.omrSettings || defaultSettings.omrSettings),
          [key]: value,
        },
      },
    }));
  },
  
  hydratePaper: (id, dbSettings, paperData, tenantNameBn) => set((state) => {
    // If items are present in the JSON (e.g. for generated sets), load them overriding relational data
    const overrideItems = (dbSettings as any)?.items;
    
    const dynamicDefaults = { ...defaultSettings };
    if (tenantNameBn) {
      dynamicDefaults.institutionName = tenantNameBn;
    }
    if (paperData) {
      if (paperData.examName || paperData.title) dynamicDefaults.examName = paperData.examName || paperData.title;
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

    if (tenantNameBn && (!finalSettings.institutionName || finalSettings.institutionName === "শিখনারী একাডেমি")) {
      finalSettings.institutionName = tenantNameBn;
    }

    const savedSettings = dbSettings && typeof dbSettings === 'object' ? (dbSettings as any) : {};
    const hasSavedExamName = typeof savedSettings.examName === 'string' && savedSettings.examName.trim().length > 0;
    const hasSavedClassName = typeof savedSettings.className === 'string' && savedSettings.className.trim().length > 0;
    const hasSavedSubjectName = typeof savedSettings.subjectName === 'string' && savedSettings.subjectName.trim().length > 0;

    if (paperData) {
      if (!hasSavedExamName && (paperData.examName || paperData.title)) {
        finalSettings.examName = paperData.examName || paperData.title;
      }
      if (!hasSavedClassName && (paperData.academicClass?.nameBn || paperData.academicClass?.nameEn)) {
        finalSettings.className = paperData.academicClass.nameBn || paperData.academicClass.nameEn;
      }
      if (!hasSavedSubjectName && paperData.subjects?.length > 0) {
        const resolvedSubjects = paperData.subjects
          .map((s: any) => s.subjectName || s.subject?.nameBn || s.subject?.nameEn)
          .filter(Boolean);
        if (resolvedSubjects.length > 0) {
          finalSettings.subjectName = resolvedSubjects.join(", ");
        }
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
        finalSettings.time = timeStr.trim();
      }
      
      if (paperData.total) {
        finalSettings.totalMarks = toBn(paperData.total);
      }
    }

    const dismissedSectionIds = finalSettings.dismissedSectionIds || [];
    const dismissedSubSectionIds = finalSettings.dismissedSubSectionIds || [];

    const paperStatus = paperData?.status || "Draft";
    const isPublished = paperStatus === "Published";
    const isSamePaper = state.paperId === id;

    return {
      paperId: id,
      paperStatus,
      isPublished,
      settings: finalSettings,
      dismissedSectionIds,
      dismissedSubSectionIds,
      items: overrideItems ? overrideItems : (isSamePaper ? state.items : []),
      calculatedBlocks: isSamePaper ? state.calculatedBlocks : [],
      selectedItemId: isSamePaper ? state.selectedItemId : null,
      activeSectionId: isSamePaper ? state.activeSectionId : null,
      activeSubSectionId: isSamePaper ? state.activeSubSectionId : null,
      hasUnsavedChanges: false,
      saveStatus: "idle",
      past: [],
      future: [],
      canUndo: false,
      canRedo: false,
    };
  }),
};
});
