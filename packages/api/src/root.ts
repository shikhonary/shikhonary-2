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
import { tenantFiscalYearRouter } from "./routers/tenant-fiscal-year/tenant-fiscal-year.router"
import { tenantWardRouter } from "./routers/tenant-ward/tenant-ward.router"
import { tenantCounterRouter } from "./routers/tenant-counter/tenant-counter.router"
import { dashboardRouter } from "./routers/dashboard/dashboard.router"
import { invitationRouter } from "./routers/invitation/invitation.router"
import { taxPayerRouter } from "./routers/tax-payer/tax-payer.router"
import { taxPaymentRouter } from "./routers/tax-payment/tax-payment.router"
import { generateTaxPaymentRouter } from "./routers/generate-tax-payment/generate-tax-payment.router"
import { tenantDashboardRouter } from "./routers/tenant-dashboard/tenant-dashboard.router"
import { locationRouter } from "./routers/location/location.router"
import { citizenRouter } from "./routers/citizen/citizen.router"
import { citizenApplicationRouter } from "./routers/citizen-application/citizen-application.router"

export const appRouter = createTRPCRouter({
  health: healthRouter,
  user: userRouter,
  role: roleRouter,
  tenant: tenantRouter,
  subscription: subscriptionRouter,
  subscriptionPlan: subscriptionPlanRouter,
  fiscalYear: fiscalYearRouter,
  tenantFiscalYear: tenantFiscalYearRouter,
  tenantWard: tenantWardRouter,
  tenantCounter: tenantCounterRouter,
  dashboard: dashboardRouter,
  invitation: invitationRouter,
  taxPayer: taxPayerRouter,
  taxPayment: taxPaymentRouter,
  generateTaxPayment: generateTaxPaymentRouter,
  tenantDashboard: tenantDashboardRouter,
  location: locationRouter,
  citizen: citizenRouter,
  citizenApplication: citizenApplicationRouter,
})

/** Type used by the client to infer procedure types end-to-end. */
export type AppRouter = typeof appRouter

/** Factory used in `trpc/server.ts` to build the RSC caller. */
export const createCaller = createCallerFactory(appRouter)
