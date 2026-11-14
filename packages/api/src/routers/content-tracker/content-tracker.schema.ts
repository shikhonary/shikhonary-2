import { z } from "zod"

export const getGlobalSummarySchema = z.object({
  academicYearId: z.string().optional(),
  classId: z.string().optional(),
})

export type GetGlobalSummaryInput = z.infer<typeof getGlobalSummarySchema>

export const getSubjectPipelineSchema = z.object({
  subjectId: z.string().min(1, "Subject ID is required"),
})

export type GetSubjectPipelineInput = z.infer<typeof getSubjectPipelineSchema>

export const getMissingAttachmentsSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  type: z.enum(["ALL", "DIAGRAM", "IMAGE", "CHART", "MAP"]).optional().default("ALL"),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
})

export type GetMissingAttachmentsInput = z.input<typeof getMissingAttachmentsSchema>

export const updateAttachmentUrlSchema = z.object({
  attachmentId: z.string().min(1, "Attachment ID is required"),
  url: z.string().min(1, "URL is required"),
  caption: z.string().optional().nullable(),
})

export type UpdateAttachmentUrlInput = z.infer<typeof updateAttachmentUrlSchema>

export const toggleQuestionActiveSchema = z.object({
  entityType: z.enum([
    "MCQ",
    "CQ",
    "SHORT_ANSWER",
    "DESCRIPTIVE_QUESTION",
    "SHORT_QUESTION",
    "CS",
    "PBQ",
  ]),
  entityId: z.string().min(1, "Entity ID is required"),
  isActive: z.boolean(),
  note: z.string().optional().nullable(),
})

export type ToggleQuestionActiveInput = z.infer<typeof toggleQuestionActiveSchema>

export const getQualityQueueSchema = z.object({
  subjectId: z.string().optional(),
  chapterId: z.string().optional(),
  entityType: z.enum(["ALL", "MCQ", "CQ", "SHORT_ANSWER"]).optional().default("ALL"),
  filter: z.enum(["ALL", "INACTIVE", "FLAGGED"]).optional().default("ALL"),
  search: z.string().optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(50).default(15),
})

export type GetQualityQueueInput = z.input<typeof getQualityQueueSchema>

export const resolveReportSchema = z.object({
  reportId: z.string().min(1, "Report ID is required"),
  resolvedNote: z.string().min(1, "Resolution note is required"),
})

export type ResolveReportInput = z.infer<typeof resolveReportSchema>
