import SwaggerAutoSyncPage from "@exts/yapi-plugin-swagger-auto-sync/views/SwaggerAutoSyncPage/SwaggerAutoSyncPage.js";
//

module.exports = function() {
  this.bindHook("sub_setting_nav", (routers) => {
    routers.test = {
      name: "Swagger自动同步",
      component: SwaggerAutoSyncPage
    };
  });
};
