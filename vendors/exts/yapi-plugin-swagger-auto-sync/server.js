const yapi = require("@server/yapi.js");
//
const controller = require("@server/controllers/SwaggerAutoSyncController.js");
const SwaggerAutoSyncUtils = require("@common/SwaggerAutoSyncUtils.js");
//
module.exports = function() {
  yapi.getInst(SwaggerAutoSyncUtils);
  //
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: controller,
      method: "get",
      path: "autoSync/get",
      action: "getSync"
    });
    addRouter({
      controller: controller,
      method: "post",
      path: "autoSync/save",
      action: "upSync"
    });
  });
};
