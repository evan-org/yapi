const Router = require("@koa/router");
const requestAction = require("@/utils/requestAction.js");
const Controller = require("@/controllers/FollowController.js");
const router = new Router({ prefix: "/follow" });
// controller: followController
/**
 *module follow
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module follow
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  await requestAction(ctx, Controller, "add");
});
/**
 *module follow
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  await requestAction(ctx, Controller, "del");
});
//
module.exports = router;
