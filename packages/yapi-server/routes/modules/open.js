const Router = require("@koa/router");
const requestAction = require("@server/utils/requestAction.js");
const Controller = require("@server/controllers/OpenController.js");
//
const GenServicesController = require("@server/controllers/GenServicesController.js");
//
const router = new Router({ prefix: "/open" });
// controller: openController
/**
 *module open
 *action projectInterfaceData
 *method get
 *@name ""
 **/
router.get("/project_interface_data", async(ctx) => {
  await requestAction(ctx, Controller, "projectInterfaceData");
});
/**
 *module open
 *action runAutoTest
 *method get
 *@name ""
 **/
router.get("/run_auto_test", async(ctx) => {
  await requestAction(ctx, Controller, "runAutoTest");
});
/**
 *module open
 *action importData
 *method post
 *@name ""
 **/
router.post("/import_data", async(ctx) => {
  await requestAction(ctx, Controller, "importData");
});
/**
 *@controller GenServicesController
 *@action exportFullData
 *@method get
 *@name ""
 **/
router.get("/plugin/export-full", async(ctx) => {
  await requestAction(ctx, GenServicesController, "exportFullData");
});
//
module.exports = router;
