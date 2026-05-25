// @ts-nocheck
/**
 * 服务端注册 YApi JSON 数据导入钩子
 */
module.exports = function () {
  this.bindHook("import_data", function (importDataModule) {
    if (!importDataModule || typeof importDataModule !== "object") {
      console.error("importDataModule 参数Must be Object Type");
      return null;
    }

    importDataModule.json = {
      name: "json",
      desc: "YApi接口 json数据导入",
      run: async (res) => {
        try {
          const interfaceData = { apis: [], cats: [] };
          const parsed = JSON.parse(res);
          parsed.forEach((item) => {
            interfaceData.cats.push({
              name: item.name,
              desc: item.desc,
            });
            item.list.forEach((api) => {
              api.catname = item.name;
            });
            interfaceData.apis = interfaceData.apis.concat(item.list);
          });
          return interfaceData;
        } catch (e) {
          console.error("YApi JSON 导入解析失败", e);
          return false;
        }
      },
    };
  });
};
