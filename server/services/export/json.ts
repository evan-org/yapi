// @ts-nocheck
/**
 * 导出 JSON 格式化（含 genServices 全路径模式）
 */
import { stripExportIds } from "../exportData.util.js";

export function buildExportJsonBody(
  list: unknown[],
  project: Record<string, unknown>,
  fullPath: boolean
) {
  let data = stripExportIds(list);
  if (!fullPath || !project.basepath) {
    return JSON.stringify(data, null, 2);
  }
  const basepath = project.basepath;
  if (Array.isArray(data)) {
    data.forEach((cate) => {
      if (Array.isArray(cate.list)) {
        cate.proBasepath = basepath;
        cate.proName = project.name;
        cate.proDescription = project.desc;
        cate.list = cate.list.map((api) => {
          api.path = api.query_path.path = (basepath + "/" + api.path).replace(
            /[\/]{2,}/g,
            "/"
          );
          return api;
        });
      }
    });
  }
  return JSON.stringify(data, null, 2);
}
