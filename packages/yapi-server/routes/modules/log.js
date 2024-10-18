const Router = require("@koa/router");
const requestAction = require("@/utils/requestAction.js");
const Controller = require("@/controllers/LogController.js");
const router = new Router({ prefix: "/log" });

// controller: logController
/**
 *module log
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module log
 *action listByUpdate
 *method post
 *@name ""
 **/
router.post("/list_by_update", async(ctx) => {
  await requestAction(ctx, Controller, "listByUpdate");
});

module.exports = router;
