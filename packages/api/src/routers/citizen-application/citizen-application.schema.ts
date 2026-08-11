import { z } from "zod"
import { idSchema, paginationSchema } from "../../schemas/common"

export const createAddressSchema = z.object({
  villageEn: z.string().optional(),
  villageBn: z.string().min(1, "Village is required"),
  roadEn: z.string().optional(),
  roadBn: z.string().optional(),
  holdingNo: z.string().optional(),
  wardId: z.string().min(1, "Ward is required"),
  
  divisionId: z.string().min(1, "Division ID is required"),
  divisionNameBn: z.string().min(1, "Division name in Bangla is required"),
  divisionNameEn: z.string().optional(),
  
  districtId: z.string().min(1, "District ID is required"),
  districtNameBn: z.string().min(1, "District name in Bangla is required"),
  districtNameEn: z.string().optional(),
  
  upazilaId: z.string().min(1, "Upazila ID is required"),
  upazilaNameBn: z.string().min(1, "Upazila name in Bangla is required"),
  upazilaNameEn: z.string().optional(),
  
  unionId: z.string().min(1, "Union ID is required"),
  unionNameBn: z.string().min(1, "Union name in Bangla is required"),
  unionNameEn: z.string().optional(),
  
  postId: z.string().min(1, "Post office ID is required"),
  postOfficeBn: z.string().min(1, "Post office name in Bangla is required"),
  postOfficeEn: z.string().optional(),
  postCode: z.string().min(1, "Postcode is required"),
})

export const createCitizenApplicationSchema = z.object({
  nid: z.string().optional(),
  birthRegNo: z.string().optional(),
  passportNo: z.string().optional(),
  nameEn: z.string().optional(),
  nameBn: z.string().min(1, "Name in Bangla is required"),
  dob: z.coerce.date().optional(),
  fatherNameEn: z.string().optional(),
  fatherNameBn: z.string().min(1, "Father's name in Bangla is required"),
  motherNameEn: z.string().optional(),
  motherNameBn: z.string().min(1, "Mother's name in Bangla is required"),
  occupation: z.string().optional(),
  residentType: z.string().min(1, "Resident type is required"),
  education: z.string().optional(),
  religion: z.string().min(1, "Religion is required"),
  gender: z.string().min(1, "Gender is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  
  presentAddress: createAddressSchema,
  sameAsPresent: z.boolean().default(false),
  permanentAddress: createAddressSchema.optional(),
  
  mobile: z.string().min(1, "Mobile number is required"),
  email: z.string().email().or(z.literal("")).optional(),
  commentsEn: z.string().optional(),
  commentsBn: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.sameAsPresent && !data.permanentAddress) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["permanentAddress"],
      message: "Permanent address is required when different from present address",
    })
  }
})

export type CreateCitizenApplicationInput = z.infer<typeof createCitizenApplicationSchema>

export const listCitizenApplicationsSchema = paginationSchema.extend({
  search: z.string().max(100).optional(),
  wardId: z.string().optional(),
  status: z.string().optional(),
  sort: z.enum(["name_asc", "name_desc", "newest", "oldest"]).optional(),
})

export type ListCitizenApplicationsInput = z.infer<typeof listCitizenApplicationsSchema>

export const getCitizenApplicationSchema = idSchema

export type GetCitizenApplicationInput = z.infer<typeof getCitizenApplicationSchema>

export const rejectCitizenApplicationSchema = z.object({
  id: z.string().min(1),
  rejectionReason: z.string().optional(),
})

export type RejectCitizenApplicationInput = z.infer<typeof rejectCitizenApplicationSchema>

export const approveCitizenApplicationSchema = idSchema

export type ApproveCitizenApplicationInput = z.infer<typeof approveCitizenApplicationSchema>

export const deleteCitizenApplicationSchema = idSchema

export type DeleteCitizenApplicationInput = z.infer<typeof deleteCitizenApplicationSchema>
