const Router = require("@koa/router");
const router = new Router({ prefix: "/log" });
/**
 *module log
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  ctx.body = "";
});
/**
 *module log
 *action listByUpdate
 *method post
 *@name ""
 **/
router.post("/list_by_update", async(ctx) => {
  ctx.body = "";
});

module.exports = router;
