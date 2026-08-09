/**
 * Root application router.
 *
 * Merges all sub-routers into a single `appRouter` that is consumed by:
 *  - The Next.js HTTP fetch handler (`app/api/trpc/[trpc]/route.ts`)
 *  - The RSC server-side caller (`trpc/server.ts` in each app)
 *
 * Add new sub-routers here as the API grows.
 */
import { createTRPCRouter, createCallerFactory } from "./trpc"
import { healthRouter } from "./routers/health"
import { userRouter } from "./routers/user/user.router"
import { roleRouter } from "./routers/role/role.router"
import { tenantRouter } from "./routers/tenant/tenant.router"
import { academicClassRouter } from "./routers/academic-class/academic-class.router"
import { studentRouter } from "./routers/student/student.router"
import { subjectRouter } from "./routers/subject/subject.router"
import { chapterRouter } from "./routers/chapter/chapter.router"
import { mcqRouter } from "./routers/mcq/mcq.router"
import { cqRouter } from "./routers/cq/cq.router"
import { examRouter } from "./routers/exam/exam.router"
import { examAttemptRouter } from "./routers/exam-attempt/exam-attempt.router"
import { examGroupRouter } from "./routers/exam-group/exam-group.router"
import { questionBankRouter } from "./routers/question-bank/question-bank.router"
import { dashboardRouter } from "./routers/dashboard/dashboard.router"

export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  role: roleRouter,
  tenant: tenantRouter,
  academicClass: academicClassRouter,
  student: studentRouter,
  subject: subjectRouter,
  chapter: chapterRouter,
  mcq: mcqRouter,
  cq: cqRouter,
  exam: examRouter,
  examAttempt: examAttemptRouter,
  examGroup: examGroupRouter,
  questionBank: questionBankRouter,
  dashboard: dashboardRouter,
})

/** Type used by the client to infer procedure types end-to-end. */
export type AppRouter = typeof appRouter

/** Factory used in `trpc/server.ts` to build the RSC caller. */
export const createCaller = createCallerFactory(appRouter)
