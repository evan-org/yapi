/**
 * PostgreSQL 建表与索引（核心表关系型列，其余 JSONB）
 */
import { getPool } from "./pg-pool.js";
import { JSONB_COLLECTIONS, RELATIONAL_COLLECTIONS, tableName } from "./table.js";

/** 关系型核心表 DDL */
const RELATIONAL_DDL: Record<(typeof RELATIONAL_COLLECTIONS)[number], string> = {
  user: `
    CREATE TABLE IF NOT EXISTS ${tableName("user")} (
      _id SERIAL PRIMARY KEY,
      username TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      passsalt TEXT NOT NULL DEFAULT '',
      study BOOLEAN NOT NULL DEFAULT FALSE,
      role TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0
    )
  `,
  group: `
    CREATE TABLE IF NOT EXISTS ${tableName("group")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      group_name TEXT NOT NULL DEFAULT '',
      group_desc TEXT NOT NULL DEFAULT '',
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'public',
      members JSONB NOT NULL DEFAULT '[]'::jsonb,
      custom_field1 JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `,
};

/** 创建所有业务表 */
export async function ensureTables(): Promise<void> {
  const pool = getPool();
  for (const col of RELATIONAL_COLLECTIONS) {
    await pool.query(RELATIONAL_DDL[col]);
  }
  for (const col of JSONB_COLLECTIONS) {
    const tbl = tableName(col);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${tbl} (
        _id SERIAL PRIMARY KEY,
        doc JSONB NOT NULL DEFAULT '{}'::jsonb
      )
    `);
  }
}

/** 创建列索引与 JSONB 表达式索引 */
export async function ensureIndexes(): Promise<void> {
  const pool = getPool();
  const statements: string[] = [
    `CREATE INDEX IF NOT EXISTS idx_yapi_user_username ON ${tableName("user")} (username)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_user_email ON ${tableName("user")} (email)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_group_uid ON ${tableName("group")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_group_name ON ${tableName("group")} (group_name)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_uid ON ${tableName("project")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_name ON ${tableName("project")} ((doc->>'name'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_group ON ${tableName("project")} ((doc->>'group_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_log_uid ON ${tableName("log")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_log_typeid ON ${tableName("log")} ((doc->>'typeid'), (doc->>'type'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_uid ON ${tableName("interface_col")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_pid ON ${tableName("interface_col")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_uid ON ${tableName("interface_cat")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_pid ON ${tableName("interface_cat")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_uid ON ${tableName("interface_case")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_col ON ${tableName("interface_case")} ((doc->>'col_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_pid ON ${tableName("interface_case")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_uid ON ${tableName("interface")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_path ON ${tableName("interface")} ((doc->>'path'), (doc->>'method'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_pid ON ${tableName("interface")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_avatar_uid ON ${tableName("avatar")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_token_pid ON ${tableName("token")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_follow_uid ON ${tableName("follow")} ((doc->>'uid'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_follow_pid ON ${tableName("follow")} ((doc->>'project_id'))`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_storage_key ON ${tableName("storage")} ((doc->>'key'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_wiki_pid ON ${tableName("wiki")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_pid ON ${tableName("adv_mock")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_iid ON ${tableName("adv_mock")} ((doc->>'interface_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_pid ON ${tableName("adv_mock_case")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_iid ON ${tableName("adv_mock_case")} ((doc->>'interface_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_date ON ${tableName("statis_mock")} ((doc->>'date'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_pid ON ${tableName("statis_mock")} ((doc->>'project_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_gid ON ${tableName("statis_mock")} ((doc->>'group_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_iid ON ${tableName("statis_mock")} ((doc->>'interface_id'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_time ON ${tableName("statis_mock")} ((doc->>'time'))`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_auto_sync ON ${tableName("interface_auto_sync")} ((doc->>'project_id'))`,
  ];
  for (const sql of statements) {
    await pool.query(sql);
  }
}

/** 连接后初始化库结构 */
export async function ensureDatabase(): Promise<void> {
  await ensureTables();
  await ensureIndexes();
}
