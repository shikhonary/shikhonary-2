import React from "react";
import { PaperBlock } from "../../../types";
import { useBuilderStore } from "../../../store/use-builder-store";
import { MCQBlock } from "../blocks/mcq-block";
import { CQBlock } from "../blocks/cq-block";
import { CSBlock } from "../blocks/cs-block";
import { ShortAnswerBlock } from "../blocks/short-answer-block";
import { ParagraphBlock } from "../blocks/paragraph-block";
import { AmplificationBlock } from "../blocks/amplification-block";
import { LetterBlock } from "../blocks/letter-block";
import { ApplicationBlock } from "../blocks/application-block";
import { HeaderBlock } from "../blocks/header-block";
import { DistActionBlock } from "./dist-action-block";
import { X, Target } from "lucide-react";
import { useDeleteSubSection, useDeleteSection } from "@/modules/question-paper/services/use-question-paper";
import { toast } from "sonner";

const toBengaliDigits = (num: number | string): string => {
  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num
    .toString()
    .split("")
    .map((digit) => (/\d/.test(digit) ? bengaliDigits[parseInt(digit)] : digit))
    .join("");
};

const SectionTitleBlock = ({ data }: { data: any }) => {
  const { id, sectionId, title, titleBn, instructions, hasQuestions, isSectionFilled, isFirstSection } = data || {};
  const secId = id || sectionId;
  const activeSectionId = useBuilderStore((state) => state.activeSectionId);
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const dismissSection = useBuilderStore((state) => state.dismissSection);

  const isActive = !isSectionFilled && activeSectionId === secId && !activeSubSectionId;
  const formattedInst = instructions
    ? instructions.trim().startsWith("[") && instructions.trim().endsWith("]")
      ? instructions.trim()
      : `[${instructions.trim()}]`
    : null;

  return (
    <div 
      onClick={() => secId && setActiveTarget({ sectionId: secId, subSectionId: null })}
      className={`group relative w-full ${isFirstSection ? "mt-0" : "mt-6"} mb-3 border-b border-on-surface/10 pb-1 flex flex-col items-center cursor-pointer transition-all ${
        isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded px-2" : "hover:bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-6"></div>
        <h3 className="font-bold text-base text-center flex-1">
          {titleBn || title}
          {isActive && (
            <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
              <Target className="w-2.5 h-2.5" /> নির্বাচনযোগ্য
            </span>
          )}
        </h3>
        {!hasQuestions && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (secId) dismissSection(secId);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
            title="বিভাগ বন্ধ করুন"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      {formattedInst && (
        <p className="text-[9px] text-muted-foreground italic text-center mt-0.5">{formattedInst}</p>
      )}
    </div>
  );
};

const SubSectionTitleBlock = ({ data }: { data: any }) => {
  const { id, subSectionId, sectionId, title, titleBn, instructions, nextSubSectionId, nextSubSectionTitle, hasQuestions, hideTitle, isSectionFilled, isFirstSubSection } = data || {};
  const subId = id || subSectionId;
  const activeSubSectionId = useBuilderStore((state) => state.activeSubSectionId);
  const setActiveTarget = useBuilderStore((state) => state.setActiveTarget);
  const { mutateAsync: deleteSubSection } = useDeleteSubSection();

  const isActive = !isSectionFilled && activeSubSectionId === subId;
  const formattedInst = instructions
    ? instructions.trim().startsWith("[") && instructions.trim().endsWith("]")
      ? instructions.trim()
      : `[${instructions.trim()}]`
    : null;

  return (
    <div 
      onClick={() => subId && setActiveTarget({ sectionId: sectionId || null, subSectionId: subId })}
      className={`group relative w-full ${isFirstSubSection ? "mt-1" : "mt-4"} mb-2 flex flex-col items-center cursor-pointer transition-all ${
        isActive ? "bg-primary/5 ring-1 ring-primary/30 rounded p-1" : "hover:bg-muted/20"
      }`}
    >
      <div className="flex items-center justify-between w-full">
        <div className="w-6"></div>
        <h4 className="font-semibold text-sm text-center flex-1">
          {titleBn || title}
          {isActive && (
            <span className="ml-2 text-[9px] bg-primary text-white font-normal px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 print:hidden">
              <Target className="w-2.5 h-2.5" /> নির্বাচনযোগ্য
            </span>
          )}
        </h4>
        {!hasQuestions && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (subId && sectionId) {
                  try {
                    await deleteSubSection({ sectionId, id: subId });
                    toast.success("উপ-বিভাগ মুছে ফেলা হয়েছে");
                    if (nextSubSectionId) {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: nextSubSectionId });
                    } else {
                      setActiveTarget({ sectionId: sectionId || null, subSectionId: null });
                    }
                  } catch (err: any) {
                    toast.error(err?.message || "মুছে ফেলতে ব্যর্থ হয়েছে");
                  }
                }
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded print:hidden"
              title="উপ-বিভাগ মুছুন"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      {formattedInst && (
        <p className="text-[9px] text-muted-foreground italic text-center mt-0.5">{formattedInst}</p>
      )}
    </div>
  );
};

const DistTitleBlock = ({ data }: { data: any }) => {
  const { dist, attemptCount, totalProvided, isCq, isMcq } = data || {};
  if (dist?.questionTypeLabel && dist.questionTypeLabel.trim() !== "") return null;

  const instructionText = (isCq || !isMcq) && attemptCount < totalProvided && attemptCount > 0 
    ? `[${toBengaliDigits(totalProvided)}টি প্রশ্ন থেকে যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
    : (isCq || !isMcq) && attemptCount > 0 
    ? `[যে কোনো ${toBengaliDigits(attemptCount)}টি প্রশ্নের উত্তর দাও]`
    : null;

  const titleText = dist.questionType?.nameBn || dist.questionTypeName || (isMcq ? "বহুনির্বাচনি অভীক্ষা" : dist.questionType?.nameEn);

  return (
    <div className="flex flex-col items-stretch w-full mb-1">
      {isMcq ? (
        <div className="flex justify-between items-center w-full">
          <div className="flex-1"></div>
          <div className="font-semibold text-center flex-[2]">{titleText}</div>
          <div className="flex-1 text-right font-bold whitespace-nowrap text-[12px] shrink-0">
            {toBengaliDigits(dist.marksPerQuestion || 1)} <span className="font-sans px-1">×</span> {toBengaliDigits(attemptCount || 1)} = {toBengaliDigits((dist.marksPerQuestion || 1) * (attemptCount || 1))}
          </div>
        </div>
      ) : (
        <>
          <div className="font-semibold text-center">
            {titleText}
          </div>
          {(instructionText || isCq) && (
            <div className="flex justify-between items-center text-[12px]">
              <div className="flex-1"></div>
              <div className="text-center font-normal flex-[2]">
                {instructionText}
              </div>
              <div className="flex-1 text-right font-bold whitespace-nowrap shrink-0">
                {toBengaliDigits(dist.marksPerQuestion || 10)} <span className="font-sans px-1">×</span> {toBengaliDigits(attemptCount || 1)} = {toBengaliDigits((dist.marksPerQuestion || 10) * (attemptCount || 1))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const SubjectTitleBlock = ({ data }: { data: any }) => {
  const { nameBn, nameEn, subjectTotal } = data || {};
  const title = nameBn || nameEn || "";
  const totalMarksText = typeof subjectTotal === "number" || subjectTotal ? ` - ${toBengaliDigits(subjectTotal)}` : "";
  return (
    <h3 className="font-bold text-center text-base">
      {title}{totalMarksText}
    </h3>
  );
};

const EmptyBlock = () => {
  const isExporting = useBuilderStore((state) => state.isExporting);
  if (isExporting) return null;
  return (
    <div className="text-center py-20 text-muted-foreground print:hidden border-2 border-dashed rounded-lg">
      কোনো বিষয় বা বণ্টন সাজানো হয়নি। অনুগ্রহ করে পাশের সেটিংস প্যানেল থেকে নম্বর বণ্টন প্রস্তুত করুন।
    </div>
  );
};

export const BlockRenderer = ({ block }: { block: PaperBlock }) => {
  switch (block.type) {
    case "header-full":
    case "header-column":
      return <HeaderBlock />;
    case "subject-title":
      return <SubjectTitleBlock data={block.data} />;
    case "section-title":
      return <SectionTitleBlock data={block.data} />;
    case "sub-section-title":
      return <SubSectionTitleBlock data={block.data} />;
    case "dist-title":
      return <DistTitleBlock data={block.data} />;
    case "question-mcq":
      return <MCQBlock item={block.data.item} hideContext={block.data.hideContext} contextInstruction={block.data.contextInstruction} />;
    case "question-cq":
      return <CQBlock item={block.data.item} />;
    case "question-cs":
      return <CSBlock item={block.data.item} />;
    case "question-short":
      return <ShortAnswerBlock item={block.data.item} />;
    case "question-paragraph":
      return <ParagraphBlock item={block.data.item} />;
    case "question-amplification":
      return <AmplificationBlock item={block.data.item} />;
    case "question-letter":
      return <LetterBlock item={block.data.item} />;
    case "question-application":
      return <ApplicationBlock item={block.data.item} />;
    case "dist-action":
      return <DistActionBlock blockData={block.data} />;
    case "empty":
      return <EmptyBlock />;
    default:
      return null;
  }
};
