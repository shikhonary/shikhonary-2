import { trpc } from "./trpc/client"

type QueryOptionsType = typeof trpc.exam.byId.queryOptions
type QueryOptionsReturn = ReturnType<QueryOptionsType>
