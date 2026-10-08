import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getAdvancedTools(ctx: AssistantToolContext): ToolSet {
  return {
    generatePaperSets: tool({
      description:
        "Generate multiple randomized exam sets (e.g., Set A, B, C, D or ক, খ, গ, ঘ) from the current question paper with question and option shuffling.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The source question paper ID. Defaults to current open paper."),
        setCodes: z
          .array(z.string().min(1))
          .describe("List of set codes to generate, e.g. ['A', 'B', 'C', 'D'] or ['ক', 'খ']"),
        shuffleQuestions: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to randomize question order in each set"),
        shuffleOptions: z
          .boolean()
          .optional()
          .default(true)
          .describe("Whether to randomize MCQ option orders in each set"),
      }),
      execute: async ({ paperId, setCodes, shuffleQuestions, shuffleOptions }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          await ctx.caller.questionPaper.generateSets({
            sourcePaperId: resolvedPaperId,
            setCodes,
            shuffleQuestions: shuffleQuestions ?? true,
            shuffleOptions: shuffleOptions ?? true,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            setCodes,
            message: `${setCodes.length}টি প্রশ্ন সেট (${setCodes.join(", ")}) সফলভাবে তৈরি করা হয়েছে।`,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to generate question paper sets",
          };
        }
      },
    }),

    addAlternativeQuestion: tool({
      description:
        "Add an alternative ('অথবা' / OR) question linked to an existing question in the paper.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The question paper ID. Defaults to current open paper."),
        parentQuestionId: z
          .string()
          .describe("The junction ID of the parent question to add an alternative to"),
        questionId: z
          .string()
          .describe("The ID of the candidate question from the question bank to set as alternative"),
        questionType: z
          .enum([
            "MCQ",
            "CQ",
            "CS",
            "SA",
            "PBQ",
            "PARAGRAPH",
            "AMPLIFICATION",
            "LETTER",
            "APPLICATION",
            "SUMMARY",
            "ESSENCE",
            "POEM_ESSENCE",
            "PROSE_ESSENCE",
            "POEM",
            "ESSAY",
            "NEWS_REPORT",
            "PARTS_OF_SPEECH",
            "RIGHT_FORM_OF_VERBS",
            "CHANGING_SENTENCES",
            "FILL_IN_THE_BLANKS_WITH_CLUES",
            "FILL_IN_THE_BLANKS_WITHOUT_CLUES",
            "SUBSTITUTION_TABLE",
            "PUNCTUATION",
            "SHORT_COMPOSITION",
            "DESCRIPTIVE_QUESTION",
            "SHORT_QUESTION",
            "MAKE_QUESTION",
            "WORD_MEANING",
            "JUKTOBORNO",
            "EK_KOTHAY_PROKASH",
            "MAKE_SENTENCES",
            "OPPOSITE_WORD",
            "SYNONYM",
            "SADHU_TO_CHOLITO",
            "POD_NIRNOY",
            "VERB_TENSE",
            "FORM_FILLUP",
            "FORM_FILLING",
            "SHUDDHO_ASHUDDHO",
            "DAN_BAM_MILKORON",
          ])
          .describe("Question category type code"),
        distributionId: z.string().optional().describe("Mark distribution ID"),
        orLabel: z.string().optional().default("অথবা").describe("Label between alternatives"),
      }),
      execute: async ({
        paperId,
        parentQuestionId,
        questionId,
        questionType,
        distributionId,
        orLabel,
      }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          await ctx.caller.questionPaper.addAlternative({
            questionPaperId: resolvedPaperId,
            parentQuestionId,
            questionId,
            questionType,
            distributionId,
            orLabel: orLabel || "অথবা",
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            message: "বিকল্প প্রশ্ন ('অথবা') সফলভাবে যুক্ত করা হয়েছে।",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to add alternative question",
          };
        }
      },
    }),

    removeAlternativeQuestion: tool({
      description: "Remove an alternative ('অথবা') question from the paper.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The question paper ID. Defaults to current open paper."),
        alternativeQuestionId: z
          .string()
          .describe("The ID of the alternative question record to remove"),
      }),
      execute: async ({ paperId, alternativeQuestionId }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          await ctx.caller.questionPaper.removeAlternative({
            questionPaperId: resolvedPaperId,
            alternativeQuestionId,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            message: "বিকল্প প্রশ্নটি সফলভাবে মুছে ফেলা হয়েছে।",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to remove alternative question",
          };
        }
      },
    }),

    swapAlternativeQuestion: tool({
      description: "Swap a parent question with its alternative question.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The question paper ID. Defaults to current open paper."),
        parentQuestionId: z
          .string()
          .describe("The junction ID of the parent question"),
        alternativeQuestionId: z
          .string()
          .describe("The ID of the alternative question to swap with parent"),
      }),
      execute: async ({ paperId, parentQuestionId, alternativeQuestionId }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          await ctx.caller.questionPaper.swapAlternative({
            questionPaperId: resolvedPaperId,
            parentQuestionId,
            alternativeQuestionId,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            message: "মূল প্রশ্ন ও বিকল্প প্রশ্ন সফলভাবে অদলবদল করা হয়েছে।",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to swap alternative question",
          };
        }
      },
    }),
  };
}
