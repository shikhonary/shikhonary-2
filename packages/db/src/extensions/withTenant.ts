import { Prisma } from "../../generated/tenant/client"

/**
 * Checks if a model definition in the Prisma DMMF has a `tenantId` field.
 */
function modelHasTenantId(modelName?: string): boolean {
  if (!modelName) return false
  const dmmf = (Prisma as any).dmmf
  const model = dmmf?.datamodel?.models?.find(
    (m: any) => m.name.toLowerCase() === modelName.toLowerCase(),
  )
  return model ? model.fields.some((f: any) => f.name === "tenantId") : false
}

export const withTenant = (tenantId: string) =>
  Prisma.defineExtension((client) => {
    return client.$extends({
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // Only inject/enforce tenantId if the model actually has a tenantId field in schema
            if (!modelHasTenantId(model as string)) {
              return query(args)
            }

            // For models that have tenantId, enforce the tenantId filter / payload
            if (
              operation === "findUnique" ||
              operation === "findFirst" ||
              operation === "findMany" ||
              operation === "count" ||
              operation === "update" ||
              operation === "updateMany" ||
              operation === "delete" ||
              operation === "deleteMany"
            ) {
              const anyArgs = args as any
              anyArgs.where = { ...anyArgs.where, tenantId }
            } else if (
              operation === "create" ||
              operation === "createMany" ||
              operation === "upsert"
            ) {
              const anyArgs = args as any
              if (operation === "create") {
                anyArgs.data = { ...anyArgs.data, tenantId }
              } else if (operation === "createMany") {
                if (Array.isArray(anyArgs.data)) {
                  anyArgs.data = anyArgs.data.map((d: any) => ({
                    ...d,
                    tenantId,
                  }))
                } else {
                  anyArgs.data = { ...anyArgs.data, tenantId }
                }
              } else if (operation === "upsert") {
                anyArgs.where = { ...anyArgs.where, tenantId }
                anyArgs.create = { ...anyArgs.create, tenantId }
              }
            }

            return query(args)
          },
        },
      },
    })
  })
