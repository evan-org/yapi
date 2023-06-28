const yapi = require("@server/yapi.js");
//
const controller = require("./controller.js");
const interfaceSyncUtils = require("./lib/interfaceSyncUtils.js");
//
module.exports = function() {
  //
  yapi.getInst(interfaceSyncUtils);
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
