-- YApi PostgreSQL 结构（新装库；应用启动时也会自动 ensureDatabase）

CREATE TABLE IF NOT EXISTS yapi_user (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_project (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_group (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_interface (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_interface_cat (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_interface_case (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_interface_col (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_follow (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_log (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_token (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE TABLE IF NOT EXISTS yapi_avatar (
  _id SERIAL PRIMARY KEY,
  doc JSONB NOT NULL DEFAULT '{}'::jsonb
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

CREATE INDEX IF NOT EXISTS idx_yapi_user_username ON yapi_user ((doc->>'username'));
CREATE UNIQUE INDEX IF NOT EXISTS idx_yapi_user_email ON yapi_user ((doc->>'email'));
CREATE INDEX IF NOT EXISTS idx_yapi_project_uid ON yapi_project ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_project_name ON yapi_project ((doc->>'name'));
CREATE INDEX IF NOT EXISTS idx_yapi_project_group ON yapi_project ((doc->>'group_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_log_uid ON yapi_log ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_log_typeid ON yapi_log ((doc->>'typeid'), (doc->>'type'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_uid ON yapi_interface_col ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_col_pid ON yapi_interface_col ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_uid ON yapi_interface_cat ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_cat_pid ON yapi_interface_cat ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_uid ON yapi_interface_case ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_col ON yapi_interface_case ((doc->>'col_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_case_pid ON yapi_interface_case ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_uid ON yapi_interface ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_path ON yapi_interface ((doc->>'path'), (doc->>'method'));
CREATE INDEX IF NOT EXISTS idx_yapi_interface_pid ON yapi_interface ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_group_uid ON yapi_group ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_group_name ON yapi_group ((doc->>'group_name'));
CREATE INDEX IF NOT EXISTS idx_yapi_avatar_uid ON yapi_avatar ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_token_pid ON yapi_token ((doc->>'project_id'));
CREATE INDEX IF NOT EXISTS idx_yapi_follow_uid ON yapi_follow ((doc->>'uid'));
CREATE INDEX IF NOT EXISTS idx_yapi_follow_pid ON yapi_follow ((doc->>'project_id'));
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
