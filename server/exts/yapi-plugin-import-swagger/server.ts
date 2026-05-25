// @ts-nocheck
module.exports = function() {
  this.bindHook("import_data", function(importDataModule) {
    importDataModule.swagger = async(res) => {
      try {
        return await require("./run")(res)
      } catch (err) {
        this.commons.log(err, "error")
        return false;
      }
    }
  })
}
