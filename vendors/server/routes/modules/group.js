const Router = require("@koa/router");
const router = new Router({ prefix: "/group" });
//
/**
 *module group
 *action getMyGroup
 *method get
 *@name ""
 **/
router.get("/get_mygroup", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action up
 *method post
 *@name ""
 **/
router.post("/up", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action addMember
 *method post
 *@name ""
 **/
router.post("/add_member", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action changeMemberRole
 *method post
 *@name ""
 **/
router.post("/change_member_role", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action delMember
 *method post
 *@name ""
 **/
router.post("/del_member", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action getMemberList
 *method get
 *@name ""
 **/
router.get("/get_member_list", async(ctx) => {
  ctx.body = "";
});
/**
 *module group
 *action get
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  ctx.body = "";
});
//
module.exports = router;
