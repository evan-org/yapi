// @ts-nocheck
const controller = require("./controller/syncController");
const yapi = require("yapi.js");
const interfaceSyncUtils = require("./interfaceSyncUtils");

module.exports = function() {
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
