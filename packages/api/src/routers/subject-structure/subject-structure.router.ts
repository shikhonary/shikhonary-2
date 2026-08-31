import { createTRPCRouter, superAdminProcedure } from "../../trpc"
import { saveSubjectStructureSchema } from "./subject-structure.schema"
import { saveSubjectStructure } from "./subject-structure.service"

export const subjectStructureRouter = createTRPCRouter({
  save: superAdminProcedure
    .input(saveSubjectStructureSchema)
    .mutation(({ ctx, input }) => saveSubjectStructure(ctx.db, input)),
})