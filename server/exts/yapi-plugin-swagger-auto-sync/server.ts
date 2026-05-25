// @ts-nocheck
import controller from './controller/syncController.js';

import yapi from 'runtime.js';

import interfaceSyncUtils from './interfaceSyncUtils.js';


export default function() {
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
