import { tool, type ToolSet } from "ai";
import { z } from "zod";
import type { AssistantToolContext } from "../types";

export function getPaperTools(ctx: AssistantToolContext): ToolSet {
  return {
    listPapers: tool({
      description: "Search and list existing question papers created for this tenant.",
      inputSchema: z.object({
        search: z.string().optional().describe("Search term for paper title or exam name"),
        status: z.enum(["Draft", "Published"]).optional().describe("Filter by status"),
        limit: z.number().min(1).max(20).optional().default(10),
      }),
      execute: async ({ search, status, limit }) => {
        try {
          const res = await ctx.caller.questionPaper.list({
            search,
            status,
            limit,
          });

          return {
            papers: (res.papers || []).map((p: any) => ({
              id: p.id,
              title: p.title,
              examName: p.examName,
              className: p.className,
              totalMarks: p.total,
              status: p.status,
              createdAt: p.createdAt,
            })),
            totalItems: res.totalItems,
          };
        } catch (error: any) {
          return { error: error?.message || "Failed to list question papers" };
        }
      },
    }),

    getPaperOverview: tool({
      description: "Get a compact overview of a question paper including subjects, mark distributions, and totals.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper to inspect"),
      }),
      execute: async ({ paperId }) => {
        try {
          const paper = await ctx.caller.questionPaper.byId({ id: paperId });
          if (!paper) return { error: "Question paper not found" };

          return {
            id: paper.id,
            title: paper.title,
            examName: paper.examName,
            className: paper.className,
            status: paper.status,
            totalMarks: paper.total,
            timeInMinutes: paper.timeInMinutes,
            subjects: (paper.subjects || []).map((s: any) => ({
              id: s.id,
              subjectName: s.subjectName,
              subjectTotal: s.subjectTotal,
              distributions: (s.distributions || []).map((d: any) => ({
                id: d.id,
                questionTypeName: d.questionTypeName,
                questionTypeNameBn: d.questionTypeNameBn,
                marksPerQuestion: d.marksPerQuestion,
                questionCount: d.questionCount,
                questionsToAttempt: d.questionsToAttempt,
                totalMarks: d.totalMarks,
                assignedCount: d.questions?.length ?? 0,
              })),
            })),
            sections: (paper.sections || []).map((sec: any) => ({
              id: sec.id,
              title: sec.title,
              titleBn: sec.titleBn,
            })),
          };
        } catch (error: any) {
          return { error: error?.message || "Failed to get paper overview" };
        }
      },
    }),

    previewPaperBlueprint: tool({
      description:
        "STEP 1 (REQUIRED): Call this tool FIRST as soon as the 4 required creation fields (Class, Subject, Exam Name, Duration) are available. DO NOT call createPaperSmart yet. This fetches the required field info and subject question types (blueprint) from the database to present to the user for preview.",
      inputSchema: z.object({
        className: z.string().describe("Class name in Bengali or English (e.g. 'দশম শ্রেণি', 'Class 10')"),
        subjectNames: z
          .array(z.string())
          .min(1)
          .describe("Subject names in Bengali or English (e.g. ['পদার্থবিজ্ঞান'])"),
        examName: z.string().describe("Exam name (e.g. 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬')"),
        timeInMinutes: z.number().int().positive().optional().default(150).describe("Duration in minutes (e.g. 150)"),
      }),
      execute: async ({ className, subjectNames, examName, timeInMinutes }) => {
        try {
          const classRes = await ctx.caller.academicClass.list({ limit: 10, query: className });
          const classes = classRes.academicClasses || [];
          const classTerm = className.trim().toLowerCase();
          const matchedClass =
            classes.find(
              (c) =>
                (c.nameBn && (c.nameBn.includes(className) || className.includes(c.nameBn))) ||
                (c.nameEn && (c.nameEn.toLowerCase().includes(classTerm) || classTerm.includes(c.nameEn.toLowerCase())))
            ) || classes[0];

          if (!matchedClass) {
            return { ok: false, error: `কোনো শ্রেণি খুঁজে পাওয়া যায়নি: "${className}"` };
          }

          const resolvedSubjects: any[] = [];
          let grandTotal = 0;

          for (const subName of subjectNames) {
            const subRes = await ctx.caller.academicSubject.list({
              limit: 10,
              classId: matchedClass.id,
              query: subName,
            });
            const subs = subRes.academicSubjects || [];
            const subTerm = subName.trim().toLowerCase();
            const matchedSub =
              subs.find(
                (s) =>
                  (s.nameBn && (s.nameBn.includes(subName) || subName.includes(s.nameBn))) ||
                  (s.nameEn && (s.nameEn.toLowerCase().includes(subTerm) || subTerm.includes(s.nameEn.toLowerCase())))
              ) || subs[0];

            if (!matchedSub) {
              return { ok: false, error: `কোনো বিষয় খুঁজে পাওয়া যায়নি: "${subName}"` };
            }

            const fullSub = await ctx.caller.academicSubject.byId({ id: matchedSub.id });
            let subjectTotal = 0;
            const distributions = (fullSub?.subjectQuestionTypes || []).map((sqt: any, idx: number) => {
              const count = sqt.questionCount || 0;
              const marks = sqt.marksPerQuestion || sqt.questionType?.defaultMarks || 1;
              const typeTotal = (sqt.questionsToAttempt || count) * marks;
              subjectTotal += typeTotal;
              grandTotal += typeTotal;
              return {
                serial: idx + 1,
                questionTypeName: sqt.questionType?.nameBn || sqt.questionType?.nameEn || "প্রশ্ন",
                questionCount: count,
                marksPerQuestion: marks,
                defaultMarks: marks,
                questionsToAttempt: sqt.questionsToAttempt || null,
                totalMarks: typeTotal,
              };
            });

            resolvedSubjects.push({
              subjectName: matchedSub.nameBn || matchedSub.nameEn,
              subjectTotal,
              distributions,
            });
          }

          return {
            ok: true,
            isPreview: true,
            requiresConfirmation: true,
            className: matchedClass.nameBn || matchedClass.nameEn,
            examName,
            timeInMinutes: timeInMinutes || 150,
            totalMarks: grandTotal,
            subjects: resolvedSubjects,
            message:
              "Exam blueprint preview generated. Present the overview and subject question types breakdown to the user in a serialized list format with default marks, and ask for explicit confirmation before creating the paper.",
          };
        } catch (error: any) {
          return { ok: false, error: error?.message || "Failed to fetch blueprint" };
        }
      },
    }),

    createPaperSmart: tool({
      description:
        "Create a question paper. IMPORTANT: If 'confirmed' is false or omitted, this tool DOES NOT save to database; instead it returns a blueprint preview of the overview and subject question breakdown. Call this with confirmed: true ONLY AFTER the user explicitly confirms creation in chat (e.g., 'yes', 'হ্যাঁ', 'ok', 'তৈরি করো').",
      inputSchema: z.object({
        className: z.string().describe("Class name in Bengali or English (e.g. 'দশম শ্রেণি', 'Class 10', 'নবম')"),
        subjectNames: z
          .array(z.string())
          .min(1)
          .describe("Subject names in Bengali or English (e.g. ['পদার্থবিজ্ঞান'] or ['বাংলা ১ম পত্র', 'বাংলা ২য় পত্র'])"),
        examName: z.string().describe("Exam name (e.g. 'অর্ধ-বার্ষিক পরীক্ষা ২০২৬', 'বার্ষিক পরীক্ষা')"),
        timeInMinutes: z.number().int().positive().optional().default(150).describe("Duration in minutes (e.g. 150)"),
        confirmed: z
          .boolean()
          .optional()
          .default(false)
          .describe("Must be true ONLY AFTER the user explicitly approves creation in chat (e.g. 'হ্যাঁ', 'তৈরি করো', 'yes')."),
      }),
      execute: async ({ className, subjectNames, examName, timeInMinutes, confirmed }) => {
        try {
          // 1. Resolve Class in DB
          const classRes = await ctx.caller.academicClass.list({ limit: 10, query: className });
          const classes = classRes.academicClasses || [];
          const classTerm = className.trim().toLowerCase();
          const matchedClass =
            classes.find(
              (c) =>
                (c.nameBn && (c.nameBn.includes(className) || className.includes(c.nameBn))) ||
                (c.nameEn && (c.nameEn.toLowerCase().includes(classTerm) || classTerm.includes(c.nameEn.toLowerCase())))
            ) || classes[0];

          if (!matchedClass) {
            return { ok: false, error: `কোনো শ্রেণি খুঁজে পাওয়া যায়নি: "${className}"` };
          }

          // 2. Resolve Subjects and Blueprints in DB
          const resolvedSubjects: any[] = [];
          let grandTotal = 0;

          for (const subName of subjectNames) {
            const subRes = await ctx.caller.academicSubject.list({
              limit: 10,
              classId: matchedClass.id,
              query: subName,
            });
            const subs = subRes.academicSubjects || [];
            const subTerm = subName.trim().toLowerCase();
            const matchedSub =
              subs.find(
                (s) =>
                  (s.nameBn && (s.nameBn.includes(subName) || subName.includes(s.nameBn))) ||
                  (s.nameEn && (s.nameEn.toLowerCase().includes(subTerm) || subTerm.includes(s.nameEn.toLowerCase())))
              ) || subs[0];

            if (!matchedSub) {
              return { ok: false, error: `কোনো বিষয় খুঁজে পাওয়া যায়নি: "${subName}" (${matchedClass.nameBn || matchedClass.nameEn})` };
            }

            // Fetch Blueprint for this subject
            const fullSub = await ctx.caller.academicSubject.byId({ id: matchedSub.id });
            let subjectTotal = 0;
            const distributions = (fullSub?.subjectQuestionTypes || []).map((sqt: any, idx: number) => {
              const count = sqt.questionCount || 0;
              const marks = sqt.marksPerQuestion || sqt.questionType?.defaultMarks || 1;
              const typeTotal = (sqt.questionsToAttempt || count) * marks;
              subjectTotal += typeTotal;
              grandTotal += typeTotal;

              return {
                serial: idx + 1,
                questionTypeId: sqt.questionTypeId || sqt.questionType?.id,
                questionTypeName: sqt.questionType?.nameBn || sqt.questionType?.nameEn || "প্রশ্ন",
                questionTypeNameEn: sqt.questionType?.nameEn || "",
                questionTypeNameBn: sqt.questionType?.nameBn || null,
                questionTypeLabel: sqt.questionType?.label || null,
                marksPerQuestion: marks,
                defaultMarks: marks,
                questionCount: count,
                questionsToAttempt: sqt.questionsToAttempt || null,
                totalMarks: typeTotal,
                orderIndex: idx,
              };
            });

            resolvedSubjects.push({
              subjectId: matchedSub.id,
              subjectName: matchedSub.nameBn || matchedSub.nameEn,
              subjectTotal,
              orderIndex: resolvedSubjects.length,
              distributions,
            });
          }

          if (!confirmed) {
            return {
              ok: true,
              isPreview: true,
              requiresConfirmation: true,
              className: matchedClass.nameBn || matchedClass.nameEn,
              examName,
              timeInMinutes: timeInMinutes || 150,
              totalMarks: grandTotal,
              subjects: resolvedSubjects.map((s) => ({
                subjectName: s.subjectName,
                subjectTotal: s.subjectTotal,
                distributions: s.distributions.map((d: any) => ({
                  serial: d.serial,
                  questionTypeName: d.questionTypeName,
                  questionCount: d.questionCount,
                  marksPerQuestion: d.marksPerQuestion,
                  defaultMarks: d.defaultMarks,
                  questionsToAttempt: d.questionsToAttempt,
                  totalMarks: d.totalMarks,
                })),
              })),
              message:
                "Exam blueprint preview generated. DO NOT save to database yet! Present the overview and subject question types breakdown to the user in a serialized list format with default marks, and ask for explicit confirmation before calling createPaperSmart with confirmed: true.",
            };
          }

          // 3. Create Title
          const title = `${matchedClass.nameBn || matchedClass.nameEn} - ${resolvedSubjects.map((s) => s.subjectName).join(", ")} - ${examName}`;

          // 4. Create Paper via tRPC
          const created = await ctx.caller.questionPaper.createFull({
            title,
            examName,
            className: matchedClass.nameBn || matchedClass.nameEn,
            classId: matchedClass.id,
            timeInMinutes: timeInMinutes || 150,
            subjects: resolvedSubjects,
          });

          return {
            ok: true,
            isPreview: false,
            paperId: created.id,
            title: created.title,
            className: matchedClass.nameBn || matchedClass.nameEn,
            subjectNames: resolvedSubjects.map((s) => s.subjectName),
            examName,
            totalMarks: created.total,
            timeInMinutes: created.timeInMinutes,
            message: `Question paper "${created.title}" successfully created.`,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to process question paper request",
          };
        }
      },
    }),

    createPaper: tool({
      description: "Create a new question paper with subjects and mark distributions. On success, the user will be redirected to the builder canvas.",
      inputSchema: z.object({
        title: z.string().min(1).describe("Full title of the paper, e.g. 'Class 10 Physics Half-Yearly Exam 2026'"),
        examName: z.string().min(1).describe("Exam name, e.g. 'অর্ধ-বার্ষিক পরীক্ষা - ২০২৬'"),
        classId: z.string().min(1).describe("The exact ID of the class (obtain from listClasses)"),
        className: z.string().min(1).describe("The name of the class, e.g. 'দশম শ্রেণি'"),
        timeInMinutes: z.number().int().nonnegative().optional().default(150).describe("Exam duration in minutes (e.g. 150 for 2.5 hours)"),
        description: z.string().optional().describe("Optional brief description"),
        subjects: z.array(
          z.object({
            subjectId: z.string().min(1).describe("The ID of the subject (from listSubjects)"),
            subjectName: z.string().min(1).describe("The name of the subject (e.g. 'Physics' or 'পদার্থবিজ্ঞান')"),
            orderIndex: z.number().int().optional().default(0),
            distributions: z.array(
              z.object({
                questionTypeId: z.string().min(1),
                questionTypeName: z.string().min(1),
                questionTypeNameBn: z.string().optional().nullable(),
                questionTypeLabel: z.string().optional().nullable(),
                marksPerQuestion: z.number().positive(),
                questionCount: z.number().int().nonnegative(),
                questionsToAttempt: z.number().int().positive().optional().nullable(),
                orderIndex: z.number().int().optional().default(0),
              })
            ),
          })
        ).describe("List of subjects with their question type distributions"),
      }),
      execute: async (input) => {
        try {
          const created = await ctx.caller.questionPaper.createFull({
            title: input.title,
            examName: input.examName,
            className: input.className,
            classId: input.classId,
            description: input.description,
            timeInMinutes: input.timeInMinutes,
            subjects: input.subjects,
          });

          return {
            ok: true,
            paperId: created.id,
            title: created.title,
            totalMarks: created.total,
            timeInMinutes: created.timeInMinutes,
            message: `Question paper "${created.title}" successfully created.`,
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to create question paper",
          };
        }
      },
    }),

    deletePaper: tool({
      description: "Delete an entire question paper permanently. Requires explicit user approval.",
      inputSchema: z.object({
        paperId: z.string().describe("The ID of the question paper to delete"),
        confirmed: z
          .boolean()
          .optional()
          .describe("Must be true only after user approves deletion in chat or via approval button."),
      }),
      execute: async ({ paperId, confirmed }) => {
        if (!confirmed) {
          return {
            ok: false,
            needsApproval: true,
            actionType: "DELETE_PAPER",
            paperId,
            actionSummary: "প্রশ্নপত্রটি সম্পূর্ণভাবে মুছে ফেলা হবে। আপনি কি নিশ্চিত?",
          };
        }

        try {
          await ctx.caller.questionPaper.delete({ id: paperId });
          return {
            ok: true,
            paperId,
            message: "প্রশ্নপত্রটি সফলভাবে মুছে ফেলা হয়েছে।",
          };
        } catch (error: any) {
          return {
            ok: false,
            error: error?.message || "Failed to delete question paper",
          };
        }
      },
    }),
  };
}
