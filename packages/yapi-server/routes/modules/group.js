const Router = require("@koa/router");
const requestAction = require("@/utils/requestAction.js");
const Controller = require("@/controllers/GroupController.js");
const router = new Router({ prefix: "/group" });
// controller: groupController
/**
 *module group
 *action getMyGroup
 *method get
 *@name ""
 **/
router.get("/get_mygroup", async(ctx) => {
  await requestAction(ctx, Controller, "getMyGroup");
});
/**
 *module group
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module group
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  await requestAction(ctx, Controller, "add");
});
/**
 *module group
 *action up
 *method post
 *@name ""
 **/
router.post("/up", async(ctx) => {
  await requestAction(ctx, Controller, "up");
});
/**
 *module group
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  await requestAction(ctx, Controller, "del");
});
/**
 *module group
 *action addMember
 *method post
 *@name ""
 **/
router.post("/add_member", async(ctx) => {
  await requestAction(ctx, Controller, "addMember");
});
/**
 *module group
 *action changeMemberRole
 *method post
 *@name ""
 **/
router.post("/change_member_role", async(ctx) => {
  await requestAction(ctx, Controller, "changeMemberRole");
});
/**
 *module group
 *action delMember
 *method post
 *@name ""
 **/
router.post("/del_member", async(ctx) => {
  await requestAction(ctx, Controller, "delMember");
});
/**
 * module group
 * Controller GroupController
 * action getMemberList
 * method get
 * @name ""
 **/
router.get("/get_member_list", async(ctx) => {
  await requestAction(ctx, Controller, "getMemberList");
});
/**
 *module group
 *action get
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  await requestAction(ctx, Controller, "get");
});
//
module.exports = router;
