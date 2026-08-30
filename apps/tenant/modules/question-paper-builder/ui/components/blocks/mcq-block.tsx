import React, { useState, useRef, useEffect } from "react";
import { RenderMath } from "@workspace/ui/components/render-math";
import { useBuilderStore } from "../../../store/use-builder-store";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Bold, Trash2, Loader2 } from "lucide-react";
import { useRemoveQuestion } from "@/modules/question-paper/services/use-question-paper";

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
    const currentSize = mergedStyle.fontSize || 12;
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
          <span className="text-[10px] w-4 text-center font-medium">{mergedStyle.fontSize}</span>
          <button onClick={() => changeSize(1)} className="p-1 px-2 rounded hover:bg-muted font-mono leading-none" title="Increase Font Size">+</button>
        </div>
      )}
      
      <div 
        ref={textRef}
        onClick={() => setIsActive(true)}
        className={`cursor-pointer transition-colors ${isActive ? "bg-primary/5 ring-1 ring-primary/20 rounded-sm" : "hover:bg-muted/30 rounded-sm"} ${className}`}
        style={{
          fontSize: mergedStyle.fontSize,
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
  const data = item.data || {};
  const paperId = useBuilderStore((state) => state.paperId);
  const settings = useBuilderStore((state) => state.settings);
  const setMcqOptionLayout = useBuilderStore((state) => state.setMcqOptionLayout);
  
  const { mutate: removeQuestion, isPending: isRemoving } = useRemoveQuestion();

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
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    textAlign: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: settings.fontWeight || "normal"
  });

  const getContextStyle = () => ({
    fontSize: settings.fontSize,
    fontFamily: settings.fontFamily,
    textAlign: "left" as const,
    lineHeight: settings.lineHeight,
    fontWeight: "medium" as const
  });

  const questionStyle = getQuestionStyle();
  const contextStyle = getContextStyle();

  const renderOptionLabel = (label: string) => {
    switch (settings.optionStyle) {
      case "dot": return <span className="shrink-0">{label}.</span>;
      case "parentheses": return <span className="shrink-0">({label})</span>;
      case "circle":
        return (
          <div className="font-bold shrink-0 flex items-center justify-center rounded-full border border-black/50 leading-none"
               style={{ width: "1.6em", height: "1.6em", fontSize: "calc(100% - 2px)", marginTop: "2px", lineHeight: "1" }}>
            {label}
          </div>
        );
      case "round": 
      default: return <span className="shrink-0">{label})</span>;
    }
  };
  
  return (
    <div className={`group relative -mx-4 px-4 hover:bg-muted/10 rounded-lg transition-colors ${breakClass}`}
         style={{ fontSize: settings.fontSize || 12, fontFamily: settings.fontFamily }}>
         
      {/* Hover Controls */}
      <div className="absolute top-1 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white border shadow-sm rounded-md flex overflow-hidden z-10 print:hidden">
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
          onClick={handleRemove}
          disabled={isRemoving}
          className={`px-2 py-1 text-xs hover:bg-destructive/10 border-l transition-colors text-destructive flex items-center gap-1 ${isRemoving ? "opacity-50" : ""}`}
          title="Remove Question"
        >
          {isRemoving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
          Remove
        </button>
      </div>

      {!hideContext && data.questionContext?.text && (
        <div className="flex gap-2">
          <span className="font-semibold shrink-0 opacity-0 select-none pointer-events-none" aria-hidden="true">
            {toBengaliDigits(item.orderIndex + 1)}.
          </span>
          <div className="flex-1 w-full min-w-0">
            {contextInstruction && (
              <div className="font-bold">{contextInstruction}</div>
            )}
            <div className="italic opacity-80 whitespace-pre-wrap w-full">
              <EditableItem 
                content={<RenderMath text={data.questionContext.text} />}
                itemKey={`${item.id}-context`}
                defaultStyle={contextStyle}
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <span className="font-semibold shrink-0">{toBengaliDigits(item.orderIndex + 1)}.</span>
        <div className="flex-1 w-full min-w-0">
          <div className="font-bold w-full">
            <EditableItem 
              content={<RenderMath text={data.question} />}
              itemKey={`${item.id}-q`}
              defaultStyle={{ ...questionStyle, fontWeight: "bold" }}
            />
          </div>
          
          {data.statements && data.statements.length > 0 && (
            <>
              <div>
                {data.statements.map((stmt: string, i: number) => (
                  <div key={i} className="flex gap-2 w-full">
                    <span className="opacity-70">{["i", "ii", "iii", "iv"][i] || (i + 1)}.</span>
                    <span className="w-full">
                      <EditableItem 
                        content={<RenderMath text={stmt} />}
                        itemKey={`${item.id}-stmt-${i}`}
                        defaultStyle={questionStyle}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <div className="font-medium">নিচের কোনটি সঠিক?</div>
            </>
          )}
          
          <div className={`grid gap-x-2 gap-y-0 ${gridClass}`}>
            {(item.overrides?.shuffledOptions || data.options || []).map((opt: string, i: number) => {
              const label = ["ক", "খ", "গ", "ঘ"][i] || "";
              
              return (
                <div key={i} className="flex gap-1.5 items-start w-full">
                  {renderOptionLabel(label)}
                  <span className="w-full">
                    <EditableItem 
                      content={<RenderMath text={opt} />}
                      itemKey={`${item.id}-opt-${i}`}
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
