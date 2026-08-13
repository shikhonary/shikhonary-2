import { z } from "zod"

export const getCounterByKeySchema = z.object({
  key: z.string().min(1, "Key is required"),
})

export type GetCounterByKeyInput = z.infer<typeof getCounterByKeySchema>

export const adjustCounterSchema = z.object({
  key: z.string().min(1, "Key is required"),
  by: z.number().int().default(1),
})

export type AdjustCounterInput = z.infer<typeof adjustCounterSchema>

export const setCounterSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.number().int(),
})

export type SetCounterInput = z.infer<typeof setCounterSchema>

export const deleteCounterSchema = z.object({
  id: z.string().min(1, "Id is required"),
})

export type DeleteCounterInput = z.infer<typeof deleteCounterSchema>
