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
  project: `
    CREATE TABLE IF NOT EXISTS ${tableName("project")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      name TEXT NOT NULL DEFAULT '',
      basepath TEXT NOT NULL DEFAULT '',
      switch_notice BOOLEAN NOT NULL DEFAULT FALSE,
      desc TEXT NOT NULL DEFAULT '',
      group_id BIGINT NOT NULL DEFAULT 0,
      project_type TEXT NOT NULL DEFAULT 'private',
      icon TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT '',
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      pre_script TEXT NOT NULL DEFAULT '',
      after_script TEXT NOT NULL DEFAULT '',
      project_mock_script TEXT NOT NULL DEFAULT '',
      is_mock_open BOOLEAN NOT NULL DEFAULT FALSE,
      strice BOOLEAN NOT NULL DEFAULT FALSE,
      is_json5 BOOLEAN NOT NULL DEFAULT FALSE,
      prd_host TEXT NOT NULL DEFAULT '',
      env JSONB NOT NULL DEFAULT '[]'::jsonb,
      members JSONB NOT NULL DEFAULT '[]'::jsonb,
      tag JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `,
  interface: `
    CREATE TABLE IF NOT EXISTS ${tableName("interface")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      title TEXT NOT NULL DEFAULT '',
      path TEXT NOT NULL DEFAULT '',
      method TEXT NOT NULL DEFAULT 'GET',
      project_id BIGINT NOT NULL DEFAULT 0,
      catid BIGINT NOT NULL DEFAULT 0,
      edit_uid BIGINT NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT '',
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT 'static',
      "index" INTEGER NOT NULL DEFAULT 0,
      api_opened BOOLEAN NOT NULL DEFAULT FALSE,
      desc TEXT NOT NULL DEFAULT '',
      req_body_type TEXT NOT NULL DEFAULT '',
      res_body_type TEXT NOT NULL DEFAULT '',
      req_body_is_json_schema BOOLEAN NOT NULL DEFAULT FALSE,
      res_body_is_json_schema BOOLEAN NOT NULL DEFAULT FALSE,
      custom_field_value TEXT NOT NULL DEFAULT '',
      markdown TEXT NOT NULL DEFAULT '',
      res_body TEXT NOT NULL DEFAULT '',
      req_body_other TEXT NOT NULL DEFAULT '',
      query_path JSONB NOT NULL DEFAULT '{}'::jsonb,
      req_query JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_headers JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_params JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_body_form JSONB NOT NULL DEFAULT '[]'::jsonb,
      tag JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `,
  interface_cat: `
    CREATE TABLE IF NOT EXISTS ${tableName("interface_cat")} (
      _id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      project_id BIGINT NOT NULL DEFAULT 0,
      uid BIGINT NOT NULL DEFAULT 0,
      desc TEXT NOT NULL DEFAULT '',
      "index" INTEGER NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0
    )
  `,
  interface_col: `
    CREATE TABLE IF NOT EXISTS ${tableName("interface_col")} (
      _id SERIAL PRIMARY KEY,
      name TEXT NOT NULL DEFAULT '',
      project_id BIGINT NOT NULL DEFAULT 0,
      uid BIGINT NOT NULL DEFAULT 0,
      desc TEXT NOT NULL DEFAULT '',
      "index" INTEGER NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      checkHttpCodeIs200 BOOLEAN NOT NULL DEFAULT FALSE,
      checkResponseSchema BOOLEAN NOT NULL DEFAULT FALSE,
      checkResponseField JSONB NOT NULL DEFAULT '{}'::jsonb,
      checkScript JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `,
  interface_case: `
    CREATE TABLE IF NOT EXISTS ${tableName("interface_case")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      casename TEXT NOT NULL DEFAULT '',
      col_id BIGINT NOT NULL DEFAULT 0,
      interface_id BIGINT NOT NULL DEFAULT 0,
      project_id BIGINT NOT NULL DEFAULT 0,
      "index" INTEGER NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      case_env TEXT NOT NULL DEFAULT '',
      req_body_type TEXT NOT NULL DEFAULT '',
      req_body_other TEXT NOT NULL DEFAULT '',
      test_script TEXT NOT NULL DEFAULT '',
      req_headers JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_query JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_params JSONB NOT NULL DEFAULT '[]'::jsonb,
      req_body_form JSONB NOT NULL DEFAULT '[]'::jsonb
    )
  `,
  log: `
    CREATE TABLE IF NOT EXISTS ${tableName("log")} (
      _id SERIAL PRIMARY KEY,
      content TEXT NOT NULL DEFAULT '',
      type TEXT NOT NULL DEFAULT '',
      uid BIGINT NOT NULL DEFAULT 0,
      username TEXT NOT NULL DEFAULT '',
      typeid BIGINT NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      data JSONB NOT NULL DEFAULT '{}'::jsonb
    )
  `,
  token: `
    CREATE TABLE IF NOT EXISTS ${tableName("token")} (
      _id SERIAL PRIMARY KEY,
      project_id BIGINT NOT NULL DEFAULT 0,
      token TEXT NOT NULL DEFAULT ''
    )
  `,
  follow: `
    CREATE TABLE IF NOT EXISTS ${tableName("follow")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      projectid BIGINT NOT NULL DEFAULT 0,
      projectname TEXT NOT NULL DEFAULT '',
      icon TEXT NOT NULL DEFAULT '',
      color TEXT NOT NULL DEFAULT ''
    )
  `,
  avatar: `
    CREATE TABLE IF NOT EXISTS ${tableName("avatar")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      type TEXT NOT NULL DEFAULT '',
      basecode TEXT NOT NULL DEFAULT ''
    )
  `,
  storage: `
    CREATE TABLE IF NOT EXISTS ${tableName("storage")} (
      _id SERIAL PRIMARY KEY,
      key TEXT NOT NULL DEFAULT '',
      data TEXT NOT NULL DEFAULT ''
    )
  `,
  wiki: `
    CREATE TABLE IF NOT EXISTS ${tableName("wiki")} (
      _id SERIAL PRIMARY KEY,
      project_id BIGINT NOT NULL DEFAULT 0,
      desc TEXT NOT NULL DEFAULT '',
      markdown TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL DEFAULT '',
      uid BIGINT NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      edit_uid BIGINT NOT NULL DEFAULT 0
    )
  `,
  adv_mock: `
    CREATE TABLE IF NOT EXISTS ${tableName("adv_mock")} (
      _id SERIAL PRIMARY KEY,
      interface_id BIGINT NOT NULL DEFAULT 0,
      project_id BIGINT NOT NULL DEFAULT 0,
      uid BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      mock_script TEXT NOT NULL DEFAULT '',
      enable BOOLEAN NOT NULL DEFAULT FALSE
    )
  `,
  adv_mock_case: `
    CREATE TABLE IF NOT EXISTS ${tableName("adv_mock_case")} (
      _id SERIAL PRIMARY KEY,
      interface_id BIGINT NOT NULL DEFAULT 0,
      project_id BIGINT NOT NULL DEFAULT 0,
      ip_enable BOOLEAN NOT NULL DEFAULT FALSE,
      name TEXT NOT NULL DEFAULT '',
      params JSONB NOT NULL DEFAULT '{}'::jsonb,
      uid BIGINT NOT NULL DEFAULT 0,
      code INTEGER NOT NULL DEFAULT 200,
      delay INTEGER NOT NULL DEFAULT 0,
      headers JSONB NOT NULL DEFAULT '[]'::jsonb,
      up_time BIGINT NOT NULL DEFAULT 0,
      res_body TEXT NOT NULL DEFAULT '',
      ip TEXT NOT NULL DEFAULT '',
      case_enable BOOLEAN NOT NULL DEFAULT TRUE
    )
  `,
  statis_mock: `
    CREATE TABLE IF NOT EXISTS ${tableName("statis_mock")} (
      _id SERIAL PRIMARY KEY,
      interface_id BIGINT NOT NULL DEFAULT 0,
      project_id BIGINT NOT NULL DEFAULT 0,
      group_id BIGINT NOT NULL DEFAULT 0,
      time BIGINT NOT NULL DEFAULT 0,
      ip TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL DEFAULT '',
      up_time BIGINT NOT NULL DEFAULT 0
    )
  `,
  interface_auto_sync: `
    CREATE TABLE IF NOT EXISTS ${tableName("interface_auto_sync")} (
      _id SERIAL PRIMARY KEY,
      uid BIGINT NOT NULL DEFAULT 0,
      project_id BIGINT NOT NULL DEFAULT 0,
      add_time BIGINT NOT NULL DEFAULT 0,
      up_time BIGINT NOT NULL DEFAULT 0,
      is_sync_open BOOLEAN NOT NULL DEFAULT FALSE,
      sync_cron TEXT NOT NULL DEFAULT '',
      sync_json_url TEXT NOT NULL DEFAULT '',
      sync_mode TEXT NOT NULL DEFAULT '',
      old_swagger_content TEXT NOT NULL DEFAULT '',
      last_sync_time BIGINT NOT NULL DEFAULT 0
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
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_uid ON ${tableName("project")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_name ON ${tableName("project")} (name)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_group ON ${tableName("project")} (group_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_project_prd_host ON ${tableName("project")} (prd_host)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_log_uid ON ${tableName("log")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_log_typeid ON ${tableName("log")} (typeid, type)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_log_add_time ON ${tableName("log")} (add_time DESC)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_uid ON ${tableName("interface_col")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_pid ON ${tableName("interface_col")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_name ON ${tableName("interface_col")} (name)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_uid ON ${tableName("interface_cat")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_pid ON ${tableName("interface_cat")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_name ON ${tableName("interface_cat")} (name)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_uid ON ${tableName("interface_case")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_col ON ${tableName("interface_case")} (col_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_pid ON ${tableName("interface_case")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_iid ON ${tableName("interface_case")} (interface_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_uid ON ${tableName("interface")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_path ON ${tableName("interface")} (path, method)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_pid ON ${tableName("interface")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_catid ON ${tableName("interface")} (catid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_interface_query_path ON ${tableName("interface")} ((query_path->>'path'))`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_avatar_uid ON ${tableName("avatar")} (uid)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_token_pid ON ${tableName("token")} (project_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_token_token ON ${tableName("token")} (token)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_follow_uid ON ${tableName("follow")} (uid)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_follow_projectid ON ${tableName("follow")} (projectid)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_follow_uid_project ON ${tableName("follow")} (uid, projectid)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_storage_key ON ${tableName("storage")} (key)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_wiki_pid ON ${tableName("wiki")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_pid ON ${tableName("adv_mock")} (project_id)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_adv_mock_iid ON ${tableName("adv_mock")} (interface_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_pid ON ${tableName("adv_mock_case")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_iid ON ${tableName("adv_mock_case")} (interface_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_date ON ${tableName("statis_mock")} (date)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_pid ON ${tableName("statis_mock")} (project_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_gid ON ${tableName("statis_mock")} (group_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_iid ON ${tableName("statis_mock")} (interface_id)`,
    `CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_time ON ${tableName("statis_mock")} (time)`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_interface_auto_sync_pid ON ${tableName("interface_auto_sync")} (project_id)`,
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
