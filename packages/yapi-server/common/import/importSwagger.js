import { message } from "antd";
import { swaggerRun } from "./swaggerRun.js";

export default {
  name: "Swagger",
  run: async function(res) {
    try {
      return await swaggerRun(res);
    } catch (err) {
      console.error(err);
      message.error("解析失败");
      return Promise.reject(err);
    }
  },
  desc: `<p>Swagger数据导入（ 支持 v2.0+ ）</p>
      <p>
        <a target="_blank" href="https://hellosean1025.github.io/yapi/documents/data.html#通过命令行导入接口数据">通过命令行导入接口数据</a>
      </p>
      `
};
