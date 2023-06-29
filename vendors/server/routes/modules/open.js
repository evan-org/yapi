const Router = require("@koa/router");
const router = new Router({ prefix: "/open" });
// controller: openController
/**
 *module open
 *action projectInterfaceData
 *method get
 *@name ""
 **/
router.get("/project_interface_data", async(ctx) => {
  ctx.body = "";
});
/**
 *module open
 *action runAutoTest
 *method get
 *@name ""
 **/
router.get("/run_auto_test", async(ctx) => {
  ctx.body = "";
});
/**
 *module open
 *action importData
 *method post
 *@name ""
 **/
router.post("/import_data", async(ctx) => {
  ctx.body = "";
});
//
module.exports = router;
