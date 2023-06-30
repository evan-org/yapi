const Router = require("@koa/router");
const requestAction = require("@server/utils/requestAction.js");
const Controller = require("@server/controllers/ProjectController.js");
const router = new Router({ prefix: "/project" });

// controller: projectController
/**
 *module project
 *action upSet
 *method post
 *@name ""
 **/
router.post("/upset", async(ctx) => {
  await requestAction(ctx, Controller, "upSet");
});
/**
 *module project
 *action getEnv
 *method get
 *@name ""
 **/
router.get("/get_env", async(ctx) => {
  await requestAction(ctx, Controller, "getEnv");
});
/**
 *module project
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  await requestAction(ctx, Controller, "add");
});
/**
 *module project
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module project
 *action get
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  await requestAction(ctx, Controller, "get");
});
/**
 *module project
 *action up
 *method post
 *@name ""
 **/
router.post("/up", async(ctx) => {
  await requestAction(ctx, Controller, "up");
});
/**
 *module project
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  await requestAction(ctx, Controller, "del");
});
/**
 *module project
 *action addMember
 *method post
 *@name ""
 **/
router.post("/add_member", async(ctx) => {
  await requestAction(ctx, Controller, "addMember");
});
/**
 *module project
 *action delMember
 *method post
 *@name ""
 **/
router.post("/del_member", async(ctx) => {
  await requestAction(ctx, Controller, "delMember");
});
/**
 *module project
 *action changeMemberRole
 *method post
 *@name ""
 **/
router.post("/change_member_role", async(ctx) => {
  await requestAction(ctx, Controller, "changeMemberRole");
});
/**
 *module project
 *action changeMemberEmailNotice
 *method post
 *@name ""
 **/
router.post("/change_member_email_notice", async(ctx) => {
  await requestAction(ctx, Controller, "changeMemberEmailNotice");
});
/**
 *module project
 *action getMemberList
 *method get
 *@name ""
 **/
router.get("/get_member_list", async(ctx) => {
  await requestAction(ctx, Controller, "getMemberList");
});
/**
 *module project
 *action search
 *method get
 *@name ""
 **/
router.get("/search", async(ctx) => {
  await requestAction(ctx, Controller, "search");
});
/**
 *module project
 *action upEnv
 *method post
 *@name ""
 **/
router.post("/up_env", async(ctx) => {
  await requestAction(ctx, Controller, "upEnv");
});
/**
 *module project
 *action upTag
 *method post
 *@name ""
 **/
router.post("/up_tag", async(ctx) => {
  await requestAction(ctx, Controller, "upTag");
});
/**
 *module project
 *action token
 *method get
 *@name ""
 **/
router.get("/token", async(ctx) => {
  await requestAction(ctx, Controller, "token");
});
/**
 *module project
 *action updateToken
 *method get
 *@name ""
 **/
router.get("/update_token", async(ctx) => {
  await requestAction(ctx, Controller, "updateToken");
});
/**
 *module project
 *action checkProjectName
 *method get
 *@name ""
 **/
router.get("/check_project_name", async(ctx) => {
  await requestAction(ctx, Controller, "checkProjectName");
});
/**
 *module project
 *action copy
 *method post
 *@name ""
 **/
router.post("/copy", async(ctx) => {
  await requestAction(ctx, Controller, "copy");
});
/**
 *module project
 *action swaggerUrl
 *method get
 *@name ""
 **/
router.get("/swagger_url", async(ctx) => {
  await requestAction(ctx, Controller, "swaggerUrl");
});
module.exports = router;
