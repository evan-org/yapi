/**
 * 业务表名 → PostgreSQL 表（yapi_ 前缀）
 */
const TABLE_PREFIX = "yapi_";

export function tableName(collection: string): string {
  return `${TABLE_PREFIX}${collection}`;
}

/** 全部业务表（关系型列存储，复杂字段使用列级 JSONB） */
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
  "avatar",
  "storage",
  "wiki",
  "adv_mock",
  "adv_mock_case",
  "statis_mock",
  "interface_auto_sync",
] as const;

/** @deprecated 使用 RELATIONAL_COLLECTIONS */
export const ALL_COLLECTIONS = RELATIONAL_COLLECTIONS;
