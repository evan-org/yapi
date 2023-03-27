import SwaggerAutoSync from "./SwaggerAutoSync/SwaggerAutoSync.js"

function hander(routers) {
  routers.test = {
    name: "Swagger自动同步",
    component: SwaggerAutoSync
  };
}

module.exports = function() {
  this.bindHook("sub_setting_nav", hander);
};
