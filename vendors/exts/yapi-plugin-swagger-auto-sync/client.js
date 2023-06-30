import SwaggerAutoSyncPage from "@client/components/SwaggerAutoSync/SwaggerAutoSync.jsx";
//

module.exports = function() {
  this.bindHook("sub_setting_nav", (routers) => {
    routers.test = {
      name: "Swagger自动同步",
      component: SwaggerAutoSyncPage
    };
  });
};
