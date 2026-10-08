import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getLookupTools(ctx: AssistantToolContext): ToolSet {
  return {
    listClasses: tool({
      description: "Find an academic class by English or Bengali name (e.g. 'Class 10' or 'দশম'). Returns ONLY the single matching class to preserve token limits.",
      inputSchema: z.object({
        search: z.string().describe("Class search term in Bengali or English (e.g. 'দশম', 'Class 10', 'নবম')"),
      }),
      execute: async ({ search }) => {
        try {
          const res = await ctx.caller.academicClass.list({
            limit: 10,
            query: search,
          });

          const classes = res.academicClasses || [];
          if (classes.length === 0) {
            return { error: `কোনো শ্রেণি পাওয়া যায়নি: "${search}"` };
          }

          const term = search.trim().toLowerCase();
          const match =
            classes.find(
              (c) =>
                (c.nameBn && (c.nameBn.includes(search) || search.includes(c.nameBn))) ||
                (c.nameEn && (c.nameEn.toLowerCase().includes(term) || term.includes(c.nameEn.toLowerCase())))
            ) || classes[0];

          if (!match) {
            return { error: `কোনো শ্রেণি পাওয়া যায়নি: "${search}"` };
          }

          const singleClass = {
            id: match.id,
            name: match.nameBn || match.nameEn,
          };

          return {
            class: singleClass,
            classes: [singleClass],
          };
        } catch (error: any) {
          return { error: error?.message || "Failed to fetch class" };
        }
      },
    }),

    listSubjects: tool({
      description: "Find an academic subject for a class by searching English or Bengali name (e.g. 'Physics' or 'পদার্থবিজ্ঞান'). Returns ONLY the single matching subject to preserve token limits.",
      inputSchema: z.object({
        classId: z.string().describe("The ID of the academic class"),
        search: z.string().describe("Subject name in Bengali or English (e.g. 'পদার্থবিজ্ঞান', 'Physics', 'বাংলা ১ম পত্র')"),
      }),
      execute: async ({ classId, search }) => {
        try {
          const res = await ctx.caller.academicSubject.list({
            limit: 10,
            classId,
            query: search,
          });

          const subjects = res.academicSubjects || [];
          if (subjects.length === 0) {
            return { error: `কোনো বিষয় পাওয়া যায়নি: "${search}"` };
          }

          const term = search.trim().toLowerCase();
          const match =
            subjects.find(
              (s) =>
                (s.nameBn && (s.nameBn.includes(search) || search.includes(s.nameBn))) ||
                (s.nameEn && (s.nameEn.toLowerCase().includes(term) || term.includes(s.nameEn.toLowerCase())))
            ) || subjects[0];

          if (!match) {
            return { error: `কোনো বিষয় পাওয়া যায়নি: "${search}"` };
          }

          const singleSubject = {
            id: match.id,
            name: match.nameBn || match.nameEn,
          };

          return {
            subject: singleSubject,
            subjects: [singleSubject],
          };
        } catch (error: any) {
          return { error: error?.message || "Failed to fetch subject" };
        }
      },
    }),

    getSubjectBlueprint: tool({
      description: "Get concise question types, marks, and distribution settings for an academic subject.",
      inputSchema: z.object({
        subjectId: z.string().describe("The ID of the academic subject"),
      }),
      execute: async ({ subjectId }) => {
        try {
          const subject = await ctx.caller.academicSubject.byId({ id: subjectId });
          if (!subject) return { error: "Subject not found" };

          // Extract only essential blueprint fields
          const questionTypes = (subject.subjectQuestionTypes || []).map((sqt: any) => ({
            questionTypeId: sqt.questionTypeId || sqt.questionType?.id,
            questionTypeName: sqt.questionType?.nameBn || sqt.questionType?.nameEn || "",
            marksPerQuestion: sqt.marksPerQuestion || 1,
            questionCount: sqt.questionCount || 0,
            questionsToAttempt: sqt.questionsToAttempt || null,
          }));

          return {
            subjectId: subject.id,
            subjectName: subject.nameBn || subject.nameEn,
            questionTypes,
          };
        } catch (error: any) {
          return { error: error?.message || "Failed to fetch subject blueprint" };
        }
      },
    }),
  };
}
