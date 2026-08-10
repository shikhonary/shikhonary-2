import { z } from "zod"

export const previewTaxGenerationSchema = z.object({
  fiscalYearId: z.string().min(1, "Fiscal year is required"),
  wardId: z.string().optional(),
  search: z.string().optional(),
})

export type PreviewTaxGenerationInput = z.infer<typeof previewTaxGenerationSchema>

export const executeTaxGenerationSchema = z.object({
  fiscalYearId: z.string().min(1, "Fiscal year is required"),
  taxPayerIds: z.array(z.string()).min(1, "At least one taxpayer must be selected"),
  note: z.string().optional().default("কর ধার্য (অপরিশোধিত)"),
})

export type ExecuteTaxGenerationInput = z.infer<typeof executeTaxGenerationSchema>

export const generationStatsSchema = z.object({
  fiscalYearId: z.string().optional(),
})

export type GenerationStatsInput = z.infer<typeof generationStatsSchema>
