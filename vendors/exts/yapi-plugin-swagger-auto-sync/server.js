const yapi = require("@server/yapi.js");
//
const SwaggerAutoSyncController = require("@server/controllers/SwaggerAutoSyncController.js");
const SwaggerAutoSyncUtils = require("@server/controllers/utils/SwaggerAutoSyncUtils.js");
//
module.exports = function() {
  yapi.getInst(SwaggerAutoSyncUtils);
  //
  this.bindHook("add_router", function(addRouter) {
    addRouter({
      controller: SwaggerAutoSyncController,
      method: "get",
      path: "autoSync/get",
      action: "getSync"
    });
    addRouter({
      controller: SwaggerAutoSyncController,
      method: "post",
      path: "autoSync/save",
      action: "upSync"
    });
  });
};
