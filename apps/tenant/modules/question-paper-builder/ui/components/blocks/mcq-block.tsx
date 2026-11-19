import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RenderMath } from "@workspace/ui/components/render-math";
import { QuestionAttachments } from "@workspace/ui/components/question-attachments";
import { useBuilderStore } from "../../../store/use-builder-store";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Trash2, Loader2, ArrowLeftRight } from "lucide-react";
import { useRemoveQuestion } from "@/modules/question-paper/services/use-question-paper";
import { McqOptionLabel, isCorrectMcqOption, getIndicatorFontSize } from "./mcq-option-label";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

const EditableItem = ({ 
  content, 
  itemKey, 
  defaultStyle,
  className = ""
}: { 
  content: React.ReactNode, 
  itemKey: string, 
  defaultStyle: any,
  className?: string
}) => {
  const [isActive, setIsActive] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const setItemStyle = useBuilderStore(state => state.setItemStyle);
  const itemStyles = useBuilderStore(state => state.settings.itemStyles);
  
  const customStyle = itemStyles?.[itemKey] || {};
  const mergedStyle = { ...defaultStyle, ...customStyle };
  
  useEffect(() => {
    if (!isActive) return;
    const handleClick = (e: MouseEvent) => {
      if (toolbarRef.current?.contains(e.target as Node)) return;
      if (textRef.current?.contains(e.target as Node)) return;
      setIsActive(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isActive]);
  
  const toggleBold = () => {
    const isBold = mergedStyle.fontWeight === "bold" || mergedStyle.fontWeight === 700 || mergedStyle.fontWeight === 600;
    setItemStyle(itemKey, { fontWeight: isBold ? "normal" : "bold" });
  };
  
  const changeSize = (delta: number) => {
    const currentSize = typeof mergedStyle.fontSize === "number" ? mergedStyle.fontSize : (parseFloat(String(mergedStyle.fontSize || 12)) || 12);
    setItemStyle(itemKey, { fontSize: currentSize + delta });
  };
  
  const changeAlign = (align: "left" | "center" | "right" | "justify") => {
    setItemStyle(itemKey, { textAlign: align });
  };

  return (
    <div className="relative group inline-block w-full">
      {isActive && (
        <div ref={toolbarRef} className="absolute -top-10 left-0 bg-white border border-border shadow-md rounded-md flex items-center p-1 gap-1 z-50 print:hidden text-xs text-foreground">
          <button onClick={() => changeAlign("left")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "left" ? "bg-primary/10 text-primary" : ""}`} title="Align Left"><AlignLeft size={14} /></button>
          <button onClick={() => changeAlign("center")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "center" ? "bg-primary/10 text-primary" : ""}`} title="Align Center"><AlignCenter size={14} /></button>
          <button onClick={() => changeAlign("right")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "right" ? "bg-primary/10 text-primary" : ""}`} title="Align Right"><AlignRight size={14} /></button>
          <button onClick={() => changeAlign("justify")} className={`p-1 rounded hover:bg-muted ${mergedStyle.textAlign === "justify" ? "bg-primary/10 text-primary" : ""}`} title="Justify"><AlignJustify size={14} /></button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button onClick={toggleBold} className={`p-1 rounded hover:bg-muted ${mergedStyle.fontWeight === "bold" || mergedStyle.fontWeight === 700 ? "bg-primary/10 text-primary" : ""}`} title="Toggle Bold"><Bold size={14} /></button>
          
          <div className="w-px h-4 bg-border mx-1"></div>
          
          <button onClick={() => changeSize(-1)} className="p-1 px-2 rounded hover:bg-muted font-mono leading-none" title="Decrease Font Size">-</button>
          <span className="text-[10px] w-4 text-center font-medium">{parseFloat(String(mergedStyle.fontSize || 12)) || 12}</span>
          <button onClick={() => changeSize(1)} className="p-1 px-2 rounded hover:bg-muted font-mono leading-none" title="Increase Font Size">+</button>
        </div>
      )}
      
      <div 
        ref={textRef}
        onClick={() => setIsActive(true)}
        className={`cursor-pointer transition-colors ${isActive ? "bg-primary/5 ring-1 ring-primary/20 rounded-sm" : "hover:bg-muted/30 rounded-sm"} ${className}`}
        style={{
          fontSize: typeof mergedStyle.fontSize === "number" ? `${mergedStyle.fontSize}pt` : mergedStyle.fontSize,
          fontFamily: mergedStyle.fontFamily,
          lineHeight: mergedStyle.lineHeight,
          textAlign: mergedStyle.textAlign,
          fontWeight: mergedStyle.fontWeight,
        }}
      >
        {content}
      </div>
    </div>
  );
};

export const MCQBlock = ({ item, hideContext = false, contextInstruction = "" }: { item: any, hideContext?: boolean, contextInstruction?: string }) => {
  const router = useRouter();
  const data = item.data || {};
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const setMcqOptionLayout = useBuilderStore((state) => state.setMcqOptionLayout);
  
  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();

  const handleExchange = () => {
    if (!paperId) return;
    const distId = item.distributionId || data.distributionId || "default";
    const params = new URLSearchParams();
    params.set("mode", "exchange");
    params.set("questionPaperQuestionId", item.id);
    if (data.id) params.set("currentQuestionId", data.id);
    params.set("category", "MCQ");
    const mNum = item.masterNumber || (item.orderIndex !== undefined ? item.orderIndex + 1 : 1);
    if (mNum) params.set("masterNumber", String(mNum));
    if (item.sectionId) params.set("sectionId", item.sectionId);
    if (item.subSectionId) params.set("subSectionId", item.subSectionId);

    router.push(`/question-papers/${paperId}/distributions/${distId}/pick?${params.toString()}`);
  };

  const handleRemove = () => {
    if (!paperId) return;
    removeQuestion({
      questionPaperId: paperId,
      questionId: data.id || item.id,
      questionType: "MCQ",
    });
  };

  const blockBreak = settings.blockBreaks?.[item.id] || "none";
  const breakClass = blockBreak === "page" ? "break-before-page" : blockBreak === "column" ? "break-before-column" : "";

  const columns = settings.mcqOptionLayouts?.[item.id] || settings.mcqOptionColumns || 2;
  const gridClass = columns === 1 ? "grid-cols-1" : columns === 4 ? "grid-cols-4" : "grid-cols-2";

  const getQuestionStyle = () => ({
    fontSize: settings.fontSize ? `${settings.fontSize}pt` : undefined,
    fontFamily: settings.fontFamily,
    textAlign: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: settings.fontWeight || "normal"
  });

  const getContextStyle = () => ({
    fontSize: settings.fontSize ? `${settings.fontSize}pt` : undefined,
    fontFamily: settings.fontFamily,
    textAlign: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: "medium" as const
  });

  const questionStyle = getQuestionStyle();
  const contextStyle = getContextStyle();
  const isCombined = (data.type || "").toUpperCase() === "COMBINED";
  const hasStimulusBanner = isCombined || Boolean(contextInstruction);
  const effectiveAttachments = (Array.isArray(data.attachments) && data.attachments.length > 0)
    ? data.attachments
    : (data.questionUrl ? [{ type: "image", url: data.questionUrl }] : []);
  const isAnswerMode = Boolean(settings.isAnswerMode);
  
  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors ${breakClass}`}
         style={{ fontSize: `${settings.fontSize || 13}pt`, fontFamily: settings.fontFamily }}>
         
      {/* Hover Controls */}
      <div className="absolute top-0 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
        <button 
          onClick={() => setMcqOptionLayout(item.id, 1)}
          className={`px-2 py-1 text-xs hover:bg-muted transition-colors ${columns === 1 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
          title="1 Option per row"
        >
          1
        </button>
        <button 
          onClick={() => setMcqOptionLayout(item.id, 2)}
          className={`px-2 py-1 text-xs hover:bg-muted border-l transition-colors ${columns === 2 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
          title="2 Options per row"
        >
          2
        </button>
        <button 
          onClick={() => setMcqOptionLayout(item.id, 4)}
          className={`px-2 py-1 text-xs hover:bg-muted border-l transition-colors ${columns === 4 ? "bg-muted font-bold text-primary" : "text-muted-foreground"}`}
          title="4 Options per row"
        >
          4
        </button>
        <button
          type="button"
          onClick={handleExchange}
          className="px-2 py-1 text-xs hover:bg-primary/10 border-l transition-colors text-primary flex items-center gap-1 cursor-pointer"
          title="একই পজিশনে প্রশ্ন পরিবর্তন/বিনিময় করুন"
        >
          <ArrowLeftRight className="w-3 h-3" />
          বিনিময়
        </button>
        <button 
          onClick={handleRemove}
          disabled={isRemoving}
          className={`px-2 py-1 text-xs hover:bg-destructive/10 border-l transition-colors text-destructive flex items-center gap-1 ${isRemoving ? "opacity-50" : ""}`}
          title="Remove Question"
        >
          {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove
        </button>
      </div>

      {/* Top Banner & Stimulus: for COMBINED or questions with shared stimulus instruction */}
      {hasStimulusBanner && !hideContext && (
        <div className="flex items-start gap-2 w-full pt-1.5 mb-0.5">
          <span
            className="font-bold shrink-0 min-w-[1.8em] invisible select-none pointer-events-none"
            style={{
              fontSize: questionStyle.fontSize,
              fontFamily: questionStyle.fontFamily,
            }}
            aria-hidden="true"
          >
            {toBengaliDigits(item.orderIndex + 1)}।
          </span>
          <div className="flex-1 w-full min-w-0">
            {contextInstruction && (
              <div className="font-bold mb-0.5 leading-snug">
                {contextInstruction}
              </div>
            )}
            {(data.questionContext?.text || data.context) && (
              <div className="italic opacity-80 whitespace-pre-wrap w-full mb-0.5">
                <EditableItem 
                  content={<RenderMath text={data.questionContext?.text || data.context} />}
                  itemKey={`${item.id}-context`}
                  defaultStyle={contextStyle}
                />
              </div>
            )}
            {/* Shared Attachments for COMBINED / shared stimulus questions */}
            <QuestionAttachments attachments={effectiveAttachments} isMath={data.isMath ?? true} />
          </div>
        </div>
      )}

      <div className="flex items-start gap-2">
        {(() => {
          const qItemKey = `${item.id}-q`;
          const qCustomStyle = settings.itemStyles?.[qItemKey];
          const qFontSize = qCustomStyle?.fontSize
            ? (typeof qCustomStyle.fontSize === "number" ? `${qCustomStyle.fontSize}pt` : qCustomStyle.fontSize)
            : questionStyle.fontSize;
          const qFontFamily = qCustomStyle?.fontFamily || questionStyle.fontFamily;

          return (
            <span
              className="font-bold shrink-0 min-w-[1.8em]"
              style={{
                fontSize: qFontSize,
                fontFamily: qFontFamily,
              }}
            >
              {toBengaliDigits(item.orderIndex + 1)}।
            </span>
          );
        })()}
        <div className="flex-1 w-full min-w-0">
          <div className="font-bold w-full">
            <EditableItem 
              content={<RenderMath text={data.question} />}
              itemKey={`${item.id}-q`}
              defaultStyle={{ ...questionStyle, fontWeight: "bold" }}
            />
          </div>

          {/* Attachments for standalone questions rendered directly below question (hidden if question has a top stimulus banner or is a child question) */}
          {!hasStimulusBanner && !hideContext && effectiveAttachments.length > 0 && (
            <QuestionAttachments attachments={effectiveAttachments} isMath={data.isMath ?? true} />
          )}
              
          {data.statements && data.statements.length > 0 && (
            <>
              <div>
                {data.statements.map((stmt: string, i: number) => {
                  const stmtKey = `${item.id}-stmt-${i}`;
                  const stmtCustomStyle = settings.itemStyles?.[stmtKey];
                  const stmtFontSize = stmtCustomStyle?.fontSize
                    ? (typeof stmtCustomStyle.fontSize === "number" ? `${stmtCustomStyle.fontSize}pt` : stmtCustomStyle.fontSize)
                    : questionStyle.fontSize;
                  const stmtFontFamily = stmtCustomStyle?.fontFamily || questionStyle.fontFamily;

                  return (
                    <div key={i} className="flex gap-2 w-full">
                      <span 
                        className="opacity-70 shrink-0"
                        style={{
                          fontSize: stmtFontSize,
                          fontFamily: stmtFontFamily,
                        }}
                      >
                        {["i", "ii", "iii", "iv"][i] || (i + 1)}.
                      </span>
                      <span className="w-full">
                        <EditableItem 
                          content={<RenderMath text={stmt} />}
                          itemKey={stmtKey}
                          defaultStyle={questionStyle}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="font-medium">নিচের কোনটি সঠিক?</div>
            </>
          )}
          
          <div className={`grid gap-x-2 gap-y-0 ${gridClass}`}>
            {(item.overrides?.shuffledOptions || data.options || []).map((opt: string, i: number) => {
              const label = ["ক", "খ", "গ", "ঘ"][i] || "";
              const isFilledAnswer = isAnswerMode && isCorrectMcqOption(data, opt, i);
              const optItemKey = `${item.id}-opt-${i}`;
              const optCustomStyle = settings.itemStyles?.[optItemKey];
              const baseFontSize = optCustomStyle?.fontSize ?? settings.fontSize ?? 13;
              const indicatorFontSize = getIndicatorFontSize(baseFontSize);
              const effectiveFontFamily = optCustomStyle?.fontFamily || settings.fontFamily;
              
              return (
                <div key={i} className="flex gap-1.5 items-start w-full">
                  <McqOptionLabel
                    label={label}
                    optionStyle={settings.optionStyle}
                    isFilledAnswer={isFilledAnswer}
                    fontSize={indicatorFontSize}
                    fontFamily={effectiveFontFamily}
                  />
                  <span className="w-full">
                    <EditableItem 
                      content={<RenderMath text={opt} />}
                      itemKey={optItemKey}
                      defaultStyle={questionStyle}
                    />
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
