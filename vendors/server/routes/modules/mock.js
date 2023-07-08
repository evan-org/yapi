const Router = require("@koa/router");
const requestAction = require("@server/utils/requestAction.js");
const Controller = require("@server/controllers/MockController.js");
//
const router = new Router({ prefix: "/mock" });
//
router.get("/:projectId/:basepath/:path", async(ctx, next) => {
  console.debug("mock => get/:projectId/:basepath/:path");
  await requestAction(ctx, Controller, "mockServer");
});
router.post("/:projectId/:basepath/:path", async(ctx, next) => {
  console.log("mock => post/:projectId/:basepath/:path");
  await requestAction(ctx, Controller, "mockServer");
});
//
module.exports = router;
