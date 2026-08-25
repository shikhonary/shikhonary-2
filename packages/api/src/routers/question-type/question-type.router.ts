import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import {
  createQuestionTypeSchema,
  deleteQuestionTypeSchema,
  getQuestionTypeSchema,
  listQuestionTypesSchema,
  updateQuestionTypeSchema,
} from "./question-type.schema"
import {
  createQuestionType,
  deleteQuestionType,
  getQuestionTypeById,
  listQuestionTypes,
  updateQuestionType,
  toggleQuestionTypeStatus,
} from "./question-type.service"

export const questionTypeRouter = createTRPCRouter({
  list: superAdminProcedure
    .input(listQuestionTypesSchema)
    .query(({ ctx, input }) => listQuestionTypes(ctx.db, input)),

  byId: superAdminProcedure
    .input(getQuestionTypeSchema)
    .query(({ ctx, input }) => getQuestionTypeById(ctx.db, input)),

  create: superAdminProcedure
    .input(createQuestionTypeSchema)
    .mutation(({ ctx, input }) => createQuestionType(ctx.db, input)),

  update: superAdminProcedure
    .input(updateQuestionTypeSchema)
    .mutation(({ ctx, input }) => updateQuestionType(ctx.db, input)),

  toggleStatus: superAdminProcedure
    .input(getQuestionTypeSchema)
    .mutation(({ ctx, input }) => toggleQuestionTypeStatus(ctx.db, input)),

  delete: superAdminProcedure
    .input(deleteQuestionTypeSchema)
    .mutation(({ ctx, input }) => deleteQuestionType(ctx.db, input)),
})
