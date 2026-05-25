-- YApi PostgreSQL 结构（新装库；应用启动时也会自动 ensureDatabase）

CREATE TABLE IF NOT EXISTS yapi_user (
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
);
CREATE TABLE IF NOT EXISTS yapi_group (
  _id SERIAL PRIMARY KEY,
  uid BIGINT NOT NULL DEFAULT 0,
  group_name TEXT NOT NULL DEFAULT '',
  group_desc TEXT NOT NULL DEFAULT '',
  add_time BIGINT NOT NULL DEFAULT 0,
  up_time BIGINT NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT 'public',
  members JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_field1 JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_project (
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
);
CREATE TABLE IF NOT EXISTS yapi_interface (
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
);
CREATE TABLE IF NOT EXISTS yapi_interface_cat (
  _id SERIAL PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  project_id BIGINT NOT NULL DEFAULT 0,
  uid BIGINT NOT NULL DEFAULT 0,
  desc TEXT NOT NULL DEFAULT '',
  "index" INTEGER NOT NULL DEFAULT 0,
  add_time BIGINT NOT NULL DEFAULT 0,
  up_time BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS yapi_interface_case (
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
);
CREATE TABLE IF NOT EXISTS yapi_interface_col (
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
);
CREATE TABLE IF NOT EXISTS yapi_follow (
  _id SERIAL PRIMARY KEY,
  uid BIGINT NOT NULL DEFAULT 0,
  projectid BIGINT NOT NULL DEFAULT 0,
  projectname TEXT NOT NULL DEFAULT '',
  icon TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS yapi_log (
  _id SERIAL PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT '',
  uid BIGINT NOT NULL DEFAULT 0,
  username TEXT NOT NULL DEFAULT '',
  typeid BIGINT NOT NULL DEFAULT 0,
  add_time BIGINT NOT NULL DEFAULT 0,
  data JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_token (
  _id SERIAL PRIMARY KEY,
  project_id BIGINT NOT NULL DEFAULT 0,
  token TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS yapi_avatar (
  _id SERIAL PRIMARY KEY,
  uid BIGINT NOT NULL DEFAULT 0,
  type TEXT NOT NULL DEFAULT '',
  basecode TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS yapi_storage (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_wiki (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_adv_mock (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_adv_mock_case (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_statis_mock (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_interface_auto_sync (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_yapi_user_username ON yapi_user (username);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_user_email ON yapi_user (email);
CREATE INDEX IF NOT EXISTS idx_yapi_group_uid ON yapi_group (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_group_name ON yapi_group (group_name);
CREATE INDEX IF NOT EXISTS idx_yapi_project_uid ON yapi_project (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_project_name ON yapi_project (name);
CREATE INDEX IF NOT EXISTS idx_yapi_project_group ON yapi_project (group_id);
CREATE INDEX IF NOT EXISTS idx_yapi_project_prd_host ON yapi_project (prd_host);
CREATE INDEX IF NOT EXISTS idx_yapi_log_uid ON yapi_log (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_log_typeid ON yapi_log (typeid, type);
CREATE INDEX IF NOT EXISTS idx_yapi_log_add_time ON yapi_log (add_time DESC);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_uid ON yapi_interface_col (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_pid ON yapi_interface_col (project_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_name ON yapi_interface_col (name);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_uid ON yapi_interface_cat (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_pid ON yapi_interface_cat (project_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_name ON yapi_interface_cat (name);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_uid ON yapi_interface_case (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_col ON yapi_interface_case (col_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_pid ON yapi_interface_case (project_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_iid ON yapi_interface_case (interface_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_uid ON yapi_interface (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_path ON yapi_interface (path, method);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_pid ON yapi_interface (project_id);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_catid ON yapi_interface (catid);
CREATE INDEX IF NOT EXISTS idx_yapi_interface_query_path ON yapi_interface ((query_path->>'path'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_avatar_uid ON yapi_avatar (uid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_token_pid ON yapi_token (project_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_token_token ON yapi_token (token);
CREATE INDEX IF NOT EXISTS idx_yapi_follow_uid ON yapi_follow (uid);
CREATE INDEX IF NOT EXISTS idx_yapi_follow_projectid ON yapi_follow (projectid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_follow_uid_project ON yapi_follow (uid, projectid);
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_storage_key ON yapi_storage ((doc->>'key'));
CREATE INDEX IF NOT EXISTS idx_yapi_wiki_pid ON yapi_wiki ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_pid ON yapi_adv_mock ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_iid ON yapi_adv_mock ((doc->>'interface_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_pid ON yapi_adv_mock_case ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_adv_mock_case_iid ON yapi_adv_mock_case ((doc->>'interface_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_date ON yapi_statis_mock ((doc->>'date'));
CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_pid ON yapi_statis_mock ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_gid ON yapi_statis_mock ((doc->>'group_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_iid ON yapi_statis_mock ((doc->>'interface_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_statis_mock_time ON yapi_statis_mock ((doc->>'time'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_auto_sync ON yapi_interface_auto_sync ((doc->>'project_id'));
