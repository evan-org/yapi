// @ts-nocheck
import runSwagger from "./run.js";

export default function () {
  this.bindHook("import_data", function (importDataModule) {
    importDataModule.swagger = async (res) => {
      try {
        return await runSwagger(res);
      } catch (err) {
        this.commons.log(err, "error");
        return false;
      }
    };
  });
}
