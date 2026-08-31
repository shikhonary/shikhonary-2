import { z } from "zod"

const questionTypeConfigSchema = z.object({
  questionTypeId: z.string().min(1),
  mark: z.number().min(0),
  requiredCount: z.number().int().min(0),
  totalQuestions: z.number().int().min(0),
  markDistribution: z.record(z.string(), z.number()).optional().nullable(),
})

export const saveSubjectStructureSchema = z.object({
  subjectId: z.string().min(1),
  sections: z.array(
    z.object({
      id: z.string().optional(),
      nameEn: z.string().min(1),
      nameBn: z.string().min(1),
      position: z.number().int().default(0),
      instructions: z.string().optional().nullable(),
      subSections: z.array(
        z.object({
          id: z.string().optional(),
          nameEn: z.string().min(1),
          nameBn: z.string().min(1),
          position: z.number().int().default(0),
          instructions: z.string().optional().nullable(),
          questionTypes: z.array(questionTypeConfigSchema),
        })
      ).default([]),
      questionTypes: z.array(questionTypeConfigSchema).default([]),
    })
  ),
})

export type SaveSubjectStructureInput = z.infer<typeof saveSubjectStructureSchema>
