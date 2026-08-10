/**
 * Public barrel for @workspace/api.
 */
export { createTRPCContext } from "./trpc"
export type {
  TRPCContext,
  AuthedTRPCContext,
  SuperAdminTRPCContext,
  TenantTRPCContext,
  TenantMemberTRPCContext,
} from "./trpc"
export { appRouter, createCaller } from "./root"
export type { AppRouter } from "./root"

export type {
  ListUsersInput,
  GetUserInput,
  UpdateUserInput,
  UpdateUserRolesInput,
  DeleteUserInput,
  CreateUserInput,
  UsersForSelectionInput,
} from "./routers/user/user.schema"

export type {
  RoleForSelectionInput,
  ListRolesInput,
  GetRoleInput,
  CreateRoleInput,
  UpdateRoleInput,
  DeleteRoleInput,
} from "./routers/role/role.schema"

export type {
  ListTenantsInput,
  GetTenantInput,
  GetTenantBySlugInput,
  CreateTenantInput,
  UpdateTenantInput,
  DeleteTenantInput,
  ToggleTenantStatusInput,
  BulkTenantActionInput,
} from "./routers/tenant/tenant.schema"

export type {
  ListSubscriptionsInput,
  GetSubscriptionInput,
  GetSubscriptionByTenantInput,
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  ChangeSubscriptionPlanInput,
  CancelSubscriptionInput,
  DeleteSubscriptionInput,
} from "./routers/subscription/subscription.schema"

export type {
  ListSubscriptionPlansInput,
  GetSubscriptionPlanInput,
  CreateSubscriptionPlanInput,
  UpdateSubscriptionPlanInput,
  DeleteSubscriptionPlanInput,
} from "./routers/subscription-plan/subscription-plan.schema"

export type {
  ListFiscalYearsInput,
  GetFiscalYearInput,
  CreateFiscalYearInput,
  UpdateFiscalYearInput,
  DeleteFiscalYearInput,
} from "./routers/fiscal-year/fiscal-year.schema"

export type {
  ListTenantFiscalYearsInput,
  GetTenantFiscalYearInput,
  CreateTenantFiscalYearInput,
  UpdateTenantFiscalYearInput,
  DeleteTenantFiscalYearInput,
} from "./routers/tenant-fiscal-year/tenant-fiscal-year.schema"

export type {
  ListTenantWardsInput,
  GetTenantWardInput,
  CreateTenantWardInput,
  UpdateTenantWardInput,
  DeleteTenantWardInput,
} from "./routers/tenant-ward/tenant-ward.schema"

export type {
  ListTaxPayersInput,
  GetTaxPayerInput,
  GetTaxPayerByHoldingInput,
  TaxPayerStatsInput,
  CreateTaxPayerInput,
  BulkCreateTaxPayerInput,
  UpdateTaxPayerInput,
  DeleteTaxPayerInput,
} from "./routers/tax-payer/tax-payer.schema"

export type {
  ListTaxPaymentsInput,
  GetTaxPaymentInput,
  GetPaymentByReceiptNoInput,
  TaxPaymentStatsInput,
  CreateTaxPaymentInput,
  UpdateTaxPaymentInput,
  DeleteTaxPaymentInput,
} from "./routers/tax-payment/tax-payment.schema"
