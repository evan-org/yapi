// @ts-nocheck
/**
 * PostgreSQL 连接池
 */
import pg from "pg";
import yapi from "../runtime.js";
const { Pool } = pg;

let pool: pg.Pool | null = null;

/** 由环境变量 / config 构建连接串 */
/** Supabase 等云库需要 SSL */
function resolveSsl(
  db: Record<string, unknown>,
  connectionString: string
): false | { rejectUnauthorized: boolean } | undefined {
  if (db.ssl === true || process.env.YAPI_DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }
  if (/supabase\.com/i.test(connectionString)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

export function buildPgConnectionString(db: Record<string, unknown>): string {
  if (db.connectString && typeof db.connectString === "string") {
    return db.connectString;
  }
  const host = String(db.servername || "127.0.0.1");
  const port = Number(db.port || 5432);
  const database = String(db.DATABASE || "yapi");
  const user = db.user ? String(db.user) : "";
  const pass = db.pass ? String(db.pass) : "";
  if (user) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(pass)}@${host}:${port}/${database}`;
  }
  return `postgresql://${host}:${port}/${database}`;
}

export function getPool(): pg.Pool {
  if (!pool) {
    throw new Error("PostgreSQL 未连接，请先调用 connect()");
  }
  return pool;
}

export async function connectPg(callback?: () => void): Promise<void> {
  const config = yapi.WEBCONFIG.db as Record<string, unknown>;
  const connectionString = buildPgConnectionString(config);
  const ssl = resolveSsl(config, connectionString);
  pool = new Pool({
    connectionString,
    max: Number(config.poolSize || 20),
    ...(ssl ? { ssl } : {}),
  });
  await pool.query("SELECT 1");
  yapi.commons.log("postgresql load success...");
  if (typeof callback === "function") {
    callback();
  }
}

export async function closePg(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
