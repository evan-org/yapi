const Router = require("@koa/router");
const router = new Router({ prefix: "/follow" });
//
/**
 *module follow
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  ctx.body = "";
});
/**
 *module follow
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  ctx.body = "";
});
/**
 *module follow
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  ctx.body = "";
});
//
module.exports = router;
