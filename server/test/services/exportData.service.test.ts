// @ts-nocheck
/**
 * exportData.service 单元测试（纯函数）
 */
import test from "ava";
import { stripExportIds } from "../../services/exportData.util.js";

test("stripExportIds 移除内部字段", (t) => {
  const data = [
    {
      _id: 1,
      name: "cat",
      list: [
        {
          _id: 2,
          uid: 3,
          catid: 4,
          project_id: 5,
          req_headers: [{ _id: 6, name: "h" }],
        },
      ],
    },
  ];
  stripExportIds(data);
  t.is(data[0]._id, undefined);
  t.is(data[0].list[0]._id, undefined);
  t.is(data[0].list[0].req_headers[0]._id, undefined);
});
