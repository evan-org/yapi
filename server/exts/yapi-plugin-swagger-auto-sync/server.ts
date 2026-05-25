// @ts-nocheck
import controller from './controller/syncController.js';
import syncUtils from './interfaceSyncUtils.js';

export default function() {
  // 单例已在模块加载时初始化定时任务
  void syncUtils;

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
