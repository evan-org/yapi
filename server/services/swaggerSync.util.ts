// @ts-nocheck
/**
 * Swagger 自动同步纯函数（无插件 model 依赖）
 */

/** 合并模式中文名 */
export function getSyncModeName(syncMode) {
  if (syncMode == "good") {
    return "智能合并";
  }
  if (syncMode == "normal") {
    return "普通模式";
  }
  if (syncMode == "merge") {
    return "完全覆盖";
  }
  return "";
}
