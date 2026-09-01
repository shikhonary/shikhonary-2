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
import { subscriptionRouter } from "./routers/subscription/subscription.router"
import { subscriptionPlanRouter } from "./routers/subscription-plan/subscription-plan.router"
import { fiscalYearRouter } from "./routers/fiscal-year/fiscal-year.router"
import { questionPaperRouter } from "./routers/question-paper/question-paper.router"
import { dashboardRouter } from "./routers/dashboard/dashboard.router"
import { invitationRouter } from "./routers/invitation/invitation.router"
import { tenantDashboardRouter } from "./routers/tenant-dashboard/tenant-dashboard.router"
import { locationRouter } from "./routers/location/location.router"
import { academicClassRouter } from "./routers/academic-class/academic-class.router"
import { academicSubjectRouter } from "./routers/academic-subject/academic-subject.router"
import { academicChapterRouter } from "./routers/academic-chapter/academic-chapter.router"
import { academicYearRouter } from "./routers/academic-year/academic-year.router"
import { questionTypeRouter } from "./routers/question-type/question-type.router"
import { mcqRouter } from "./routers/mcq/mcq.router"
import { cqRouter } from "./routers/cq/cq.router"
import { csRouter } from "./routers/cs/cs.router"
import { shortAnswerRouter } from "./routers/short-answer/short-answer.router"
import { subjectStructureRouter } from "./routers/subject-structure/subject-structure.router"
import { paragraphRouter } from "./routers/paragraph/paragraph.router"
import { amplificationRouter } from "./routers/amplification/amplification.router"

export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  role: roleRouter,
  tenant: tenantRouter,
  subscription: subscriptionRouter,
  subscriptionPlan: subscriptionPlanRouter,
  fiscalYear: fiscalYearRouter,
  questionPaper: questionPaperRouter,
  dashboard: dashboardRouter,
  invitation: invitationRouter,
  tenantDashboard: tenantDashboardRouter,
  location: locationRouter,
  academicClass: academicClassRouter,
  academicSubject: academicSubjectRouter,
  academicChapter: academicChapterRouter,
  academicYear: academicYearRouter,
  questionType: questionTypeRouter,
  mcq: mcqRouter,
  cq: cqRouter,
  cs: csRouter,
  shortAnswer: shortAnswerRouter,
  subjectStructure: subjectStructureRouter,
  paragraph: paragraphRouter,
  amplification: amplificationRouter,
})

/** Type used by the client to infer procedure types end-to-end. */
export type AppRouter = typeof appRouter

/** Factory used in `trpc/server.ts` to build the RSC caller. */
export const createCaller = createCallerFactory(appRouter)
