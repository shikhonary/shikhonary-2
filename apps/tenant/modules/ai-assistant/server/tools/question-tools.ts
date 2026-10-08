import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getQuestionTools(ctx: AssistantToolContext): ToolSet {
  return {
    autoFillDistribution: tool({
      description:
        "Automatically select and assign questions into a mark distribution slot using server-side selection, preventing token overhead. Target count defaults to the remaining needed count for that distribution slot.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The ID of the question paper. If omitted, uses the active paper in builder."),
        distributionId: z
          .string()
          .describe("The ID of the mark distribution slot (e.g. from getPaperOverview)."),
        count: z
          .number()
          .int()
          .positive()
          .optional()
          .describe("Number of questions to pick and assign. Defaults to remaining unfilled count."),
        chapterId: z
          .string()
          .optional()
          .describe("Optional chapter filter ID to select questions exclusively from this chapter."),
        difficulty: z
          .enum(["EASY", "MEDIUM", "HARD"])
          .optional()
          .describe("Optional question difficulty filter."),
        board: z
          .string()
          .optional()
          .describe("Optional board filter (e.g. 'Dhaka', 'Rajshahi')."),
        source: z
          .string()
          .optional()
          .describe("Optional question source filter (e.g. 'Textbook', 'Board Exam')."),
      }),
      execute: async ({
        paperId,
        distributionId,
        count,
        chapterId,
        difficulty,
        board,
        source,
      }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          const res = await ctx.caller.questionPaper.autoFillDistribution({
            questionPaperId: resolvedPaperId,
            distributionId,
            count,
            chapterId,
            difficulty,
            board,
            source,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            distributionId,
            addedCount: res.addedCount,
            totalAssigned: res.totalAssigned,
            targetCount: res.targetCount,
            message: res.message,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to auto-fill questions for distribution",
          };
        }
      },
    }),

    replaceQuestion: tool({
      description:
        "Exchange or replace a single question in the paper with another suitable question matching the same distribution slot and filters, executed completely server-side.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The ID of the question paper. If omitted, uses the active paper in builder."),
        questionPaperQuestionId: z
          .string()
          .describe("The ID of the question paper question junction, or the question ID to replace."),
        chapterId: z
          .string()
          .optional()
          .describe("Optional new chapter ID filter for the replacement."),
        difficulty: z
          .enum(["EASY", "MEDIUM", "HARD"])
          .optional()
          .describe("Optional difficulty filter for the replacement."),
      }),
      execute: async ({
        paperId,
        questionPaperQuestionId,
        chapterId,
        difficulty,
      }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          const res = await ctx.caller.questionPaper.replaceQuestion({
            questionPaperId: resolvedPaperId,
            questionPaperQuestionId,
            chapterId,
            difficulty,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            oldQuestionId: res.oldQuestionId,
            newQuestionId: res.newQuestionId,
            message: res.message,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to replace question",
          };
        }
      },
    }),

    removeQuestions: tool({
      description:
        "Remove one or more questions from the question paper by their IDs. Removing more than 2 questions requires explicit confirmation.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The ID of the question paper. If omitted, uses the active paper in builder."),
        questionIds: z
          .array(z.string().min(1))
          .describe("List of question IDs or junction IDs to remove."),
        confirmed: z
          .boolean()
          .optional()
          .describe("Must be true only after user approves removal of multiple questions."),
      }),
      execute: async ({ paperId, questionIds, confirmed }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        if (questionIds.length > 2 && !confirmed) {
          return {
            ok: false,
            needsApproval: true,
            actionType: "REMOVE_QUESTIONS",
            paperId: resolvedPaperId,
            questionIds,
            count: questionIds.length,
            actionSummary: `${questionIds.length}টি প্রশ্ন একবারে মুছে ফেলা হবে। আপনি কি নিশ্চিত?`,
          };
        }

        try {
          await ctx.caller.questionPaper.bulkRemoveQuestions({
            questionPaperId: resolvedPaperId,
            questionIds,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            removedCount: questionIds.length,
            message: `Successfully removed ${questionIds.length} question(s).`,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to remove questions",
          };
        }
      },
    }),

    reorderQuestions: tool({
      description:
        "Update the order/sequence of questions within the paper.",
      inputSchema: z.object({
        paperId: z
          .string()
          .optional()
          .describe("The ID of the question paper. If omitted, uses the active paper in builder."),
        questionOrders: z
          .array(
            z.object({
              id: z.string().describe("The junction question id"),
              orderIndex: z.number().int().describe("New 0-indexed position"),
            })
          )
          .describe("List of question IDs and their new order positions."),
      }),
      execute: async ({ paperId, questionOrders }) => {
        const resolvedPaperId = paperId || ctx.pageContext?.paperId;
        if (!resolvedPaperId) {
          return {
            ok: false,
            error: "No active question paper ID found. Please specify paperId.",
          };
        }

        try {
          await ctx.caller.questionPaper.reorderQuestions({
            questionPaperId: resolvedPaperId,
            questionOrders,
          });

          return {
            ok: true,
            paperId: resolvedPaperId,
            count: questionOrders.length,
            message: "Questions reordered successfully.",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to reorder questions",
          };
        }
      },
    }),
  };
}
