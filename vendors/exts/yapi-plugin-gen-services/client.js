import GenServicesPage from "./GenServicesPage/GenServicesPage.js";

function genServices(routers) {
  routers["services"] = {
    name: "生成 ts services",
    component: GenServicesPage
  }
}

module.exports = function() {
  this.bindHook("sub_setting_nav", genServices);
};
