import { Pool, neonConfig } from "@neondatabase/serverless"
import ws from "ws"

type QueryExecutor = {
  query: (text: string, params?: unknown[]) => Promise<{ rows: unknown[] }>
}

export type DbClient = {
  <T = unknown[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T>
  query<T = unknown[]>(text: string, params?: unknown[]): Promise<T>
  withTransaction<T>(callback: (tx: DbClient) => Promise<T>): Promise<T>
}

let pool: Pool | null = null
let dbClient: DbClient | null = null

if (!neonConfig.webSocketConstructor) {
  neonConfig.webSocketConstructor = ws
}

function compileQuery(strings: TemplateStringsArray, values: unknown[]) {
  let text = ""

  for (let index = 0; index < strings.length; index += 1) {
    text += strings[index]
    if (index < values.length) {
      text += `$${index + 1}`
    }
  }

  return { text, params: values }
}

function createDbForExecutor(executor: QueryExecutor, withTransaction: DbClient["withTransaction"]): DbClient {
  const sql = (async <T = unknown[]>(strings: TemplateStringsArray, ...values: unknown[]) => {
    const { text, params } = compileQuery(strings, values)
    const result = await executor.query(text, params)
    return result.rows as T
  }) as DbClient

  sql.query = async <T = unknown[]>(text: string, params?: unknown[]) => {
    const result = await executor.query(text, params)
    return result.rows as T
  }

  sql.withTransaction = withTransaction

  return sql
}

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL

    if (!connectionString) {
      throw new Error("DATABASE_URL is not configured.")
    }

    pool = new Pool({
      connectionString,
      max: 5,
    })
  }

  return pool
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL)
}

export function getDb() {
  if (!dbClient) {
    const livePool = getPool()

    const withTransaction: DbClient["withTransaction"] = async (callback) => {
      const client = await livePool.connect()

      try {
        await client.query("BEGIN")
        let txDb!: DbClient
        txDb = createDbForExecutor(client, async (inner) => inner(txDb))
        const result = await callback(txDb)
        await client.query("COMMIT")
        return result
      } catch (error) {
        await client.query("ROLLBACK")
        throw error
      } finally {
        client.release()
      }
    }

    dbClient = createDbForExecutor(livePool, withTransaction)
  }

  return dbClient
}
