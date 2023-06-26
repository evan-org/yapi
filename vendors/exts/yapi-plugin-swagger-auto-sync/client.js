import SwaggerAutoSyncPage from "@exts/yapi-plugin-swagger-auto-sync/views/SwaggerAutoSyncPage/SwaggerAutoSyncPage.js"

function hander(routers) {
  routers.test = {
    name: "Swagger自动同步",
    component: SwaggerAutoSyncPage
  };
}

module.exports = function() {
  this.bindHook("sub_setting_nav", hander);
};
