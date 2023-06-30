import { message } from "antd";
//
async function run(res) {
  try {
    let interfaceData = { apis: [], cats: [] };
    res = JSON.parse(res);
    res.forEach((item) => {
      interfaceData.cats.push({
        name: item.name,
        desc: item.desc
      });
      item.list.forEach((api) => {
        api.catname = item.name;
      });
      interfaceData.apis = interfaceData.apis.concat(item.list);
    });
    return interfaceData;
  } catch (e) {
    console.error(e);
    message.error("数据格式有误");
  }
}
export default {
  name: "json",
  run: run,
  desc: "YApi接口 json数据导入"
}
