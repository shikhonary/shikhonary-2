import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getStructureTools(ctx: AssistantToolContext): ToolSet {
  return {
    upsertSection: tool({
      description: "Create or update a visual presentation section (e.g. 'বিভাগ ক - বহুনির্বাচনী', 'Section A') in the paper.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper"),
        sectionId: z.string().optional().describe("Provide existing sectionId if updating, or omit to create a new section"),
        title: z.string().min(1).describe("Section title, e.g. 'বিভাগ ক' or 'Section A'"),
        titleBn: z.string().optional().describe("Bengali title (optional)"),
        instructions: z.string().optional().describe("Instructions for this section, e.g. 'যেকোনো ৫টি প্রশ্নের উত্তর দাও'"),
        orderIndex: z.number().int().optional().default(0),
      }),
      execute: async ({ paperId, sectionId, title, titleBn, instructions, orderIndex }) => {
        try {
          const res = await ctx.caller.questionPaper.upsertSection({
            questionPaperId: paperId,
            id: sectionId,
            title,
            titleBn,
            instructions,
            orderIndex,
          });

          return {
            ok: true,
            paperId,
            sectionId: res.id,
            title: res.title,
            message: `Section "${res.title}" successfully saved.`,
          };
        } catch (error: any) {
          return { ok: false, error: error?.message || "Failed to upsert section" };
        }
      },
    }),

    deleteSection: tool({
      description: "Delete a presentation section from the question paper. Requires explicit user approval.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper"),
        sectionId: z.string().describe("The ID of the section to delete"),
        confirmed: z.boolean().optional().describe("Must be true only after user approves deletion."),
      }),
      execute: async ({ paperId, sectionId, confirmed }) => {
        if (!confirmed) {
          return {
            ok: false,
            needsApproval: true,
            actionType: "DELETE_SECTION",
            paperId,
            sectionId,
            actionSummary: "সেকশনটি প্রশ্নপত্র থেকে মুছে ফেলা হবে। আপনি কি নিশ্চিত?",
          };
        }

        try {
          await ctx.caller.questionPaper.deleteSection({
            questionPaperId: paperId,
            id: sectionId,
          });

          return {
            ok: true,
            paperId,
            sectionId,
            message: "Section successfully deleted.",
          };
        } catch (error: any) {
          return { ok: false, error: error?.message || "Failed to delete section" };
        }
      },
    }),

    upsertSubject: tool({
      description: "Add or update an academic subject in the question paper.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper"),
        subjectId: z.string().describe("The academic subject ID (from listSubjects)"),
        subjectName: z.string().describe("Subject name, e.g. 'Physics' or 'পদার্থবিজ্ঞান'"),
      }),
      execute: async ({ paperId, subjectId, subjectName }) => {
        try {
          const res = await ctx.caller.questionPaper.upsertSubject({
            questionPaperId: paperId,
            subjectId,
            subjectName,
          });

          return {
            ok: true,
            paperId,
            paperSubjectId: res.id,
            subjectName: res.subjectName,
            message: `Subject "${res.subjectName}" successfully added/updated.`,
          };
        } catch (error: any) {
          return { ok: false, error: error?.message || "Failed to upsert subject" };
        }
      },
    }),

    deleteSubject: tool({
      description: "Remove an academic subject and its distributions from the question paper. Requires explicit user approval.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper"),
        paperSubjectId: z.string().describe("The ID of the paper-subject link to remove"),
        confirmed: z.boolean().optional().describe("Must be true only after user approves subject deletion."),
      }),
      execute: async ({ paperId, paperSubjectId, confirmed }) => {
        if (!confirmed) {
          return {
            ok: false,
            needsApproval: true,
            actionType: "DELETE_SUBJECT",
            paperId,
            paperSubjectId,
            actionSummary: "বিষয়টি ও এর অন্তর্ভুক্ত মানবণ্টন মুছে ফেলা হবে। আপনি কি নিশ্চিত?",
          };
        }

        try {
          await ctx.caller.questionPaper.deleteSubject({
            questionPaperId: paperId,
            id: paperSubjectId,
          });

          return {
            ok: true,
            paperId,
            paperSubjectId,
            message: "Subject successfully removed from the question paper.",
          };
        } catch (error: any) {
          return { ok: false, error: error?.message || "Failed to delete subject" };
        }
      },
    }),
  };
}
