// @ts-nocheck
/**
 * 接口导出插件纯函数（无 DB / wiki 依赖，便于单测）
 */

/**
 * 导出 JSON 时移除内部 id 字段
 */
export function stripExportIds(data) {
  function delArrId(arr, fn) {
    if (!Array.isArray(arr)) {
      return;
    }
    arr.forEach((item) => {
      delete item._id;
      delete item.__v;
      delete item.uid;
      delete item.edit_uid;
      delete item.catid;
      delete item.project_id;
      if (typeof fn === "function") {
        fn(item);
      }
    });
  }

  delArrId(data, function (item) {
    delArrId(item.list, function (api) {
      delArrId(api.req_body_form);
      delArrId(api.req_params);
      delArrId(api.req_query);
      delArrId(api.req_headers);
      if (api.query_path && typeof api.query_path === "object") {
        delArrId(api.query_path.params);
      }
    });
  });
  return data;
}
