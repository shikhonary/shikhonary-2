import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const listCitizensSchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  wardId: z.string().optional(),
  residentType: z.string().optional(),
  sort: z.enum(["name_asc", "name_desc", "newest", "oldest"]).optional(),
})

export type ListCitizensInput = z.infer<typeof listCitizensSchema>

export const getCitizenSchema = idSchema

export type GetCitizenInput = z.infer<typeof getCitizenSchema>

export const updateAddressSchema = z.object({
  villageEn: z.string().optional(),
  villageBn: z.string().min(1, "Village is required").optional(),
  roadEn: z.string().optional(),
  roadBn: z.string().optional(),
  holdingNo: z.string().optional(),
  wardId: z.string().min(1, "Ward is required").optional(),
  
  divisionId: z.string().min(1).optional(),
  divisionNameBn: z.string().min(1).optional(),
  divisionNameEn: z.string().optional(),
  
  districtId: z.string().min(1).optional(),
  districtNameBn: z.string().min(1).optional(),
  districtNameEn: z.string().optional(),
  
  upazilaId: z.string().min(1).optional(),
  upazilaNameBn: z.string().min(1).optional(),
  upazilaNameEn: z.string().optional(),
  
  unionId: z.string().min(1).optional(),
  unionNameBn: z.string().min(1).optional(),
  unionNameEn: z.string().optional(),
  
  postId: z.string().min(1).optional(),
  postOfficeBn: z.string().min(1).optional(),
  postOfficeEn: z.string().optional(),
  postCode: z.string().min(1).optional(),
})

export const updateCitizenSchema = z.object({
  id: z.string().min(1),
  nameEn: z.string().optional(),
  nameBn: z.string().min(1).optional(),
  dob: z.coerce.date().optional(),
  fatherNameEn: z.string().optional(),
  fatherNameBn: z.string().min(1).optional(),
  motherNameEn: z.string().optional(),
  motherNameBn: z.string().min(1).optional(),
  occupation: z.string().optional(),
  residentType: z.string().optional(),
  education: z.string().optional(),
  religion: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  mobile: z.string().optional(),
  email: z.string().email().or(z.literal("")).optional(),
  commentsEn: z.string().optional(),
  commentsBn: z.string().optional(),

  presentAddress: updateAddressSchema.optional(),
  permanentAddress: updateAddressSchema.optional(),
  sameAsPresent: z.boolean().optional(),
})

export type UpdateCitizenInput = z.infer<typeof updateCitizenSchema>

export const deleteCitizenSchema = idSchema

export type DeleteCitizenInput = z.infer<typeof deleteCitizenSchema>
