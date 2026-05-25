/**
 * 集合名 → PostgreSQL 表名（与历史 Mongo collection 对应）
 */
const TABLE_PREFIX = "yapi_";

export function tableName(collection: string): string {
  return `${TABLE_PREFIX}${collection}`;
}

/** 所有业务表（含插件 collection） */
export const ALL_COLLECTIONS = [
  "user",
  "project",
  "group",
  "interface",
  "interface_cat",
  "interface_case",
  "interface_col",
  "follow",
  "log",
  "token",
  "avatar",
  "storage",
  "wiki",
  "adv_mock",
  "adv_mock_case",
  "statis_mock",
  "interface_auto_sync",
] as const;
