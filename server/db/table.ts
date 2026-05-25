/**
 * 业务表名 → PostgreSQL 表（yapi_ 前缀）
 */
const TABLE_PREFIX = "yapi_";

export function tableName(collection: string): string {
  return `${TABLE_PREFIX}${collection}`;
}

/** 关系型列存储（全新开发核心表） */
export const RELATIONAL_COLLECTIONS = [
  "user",
  "group",
  "project",
  "interface",
  "interface_cat",
  "interface_col",
  "interface_case",
  "log",
  "token",
  "follow",
] as const;

/** JSONB 文档存储（结构复杂或插件表） */
export const JSONB_COLLECTIONS = [
  "avatar",
  "storage",
  "wiki",
  "adv_mock",
  "adv_mock_case",
  "statis_mock",
  "interface_auto_sync",
] as const;

/** 全部逻辑集合名 */
export const ALL_COLLECTIONS = [
  ...RELATIONAL_COLLECTIONS,
  ...JSONB_COLLECTIONS,
] as const;
