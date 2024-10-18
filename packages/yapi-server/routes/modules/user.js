const Router = require("@koa/router");
const requestAction = require("@/utils/requestAction.js");
const Controller = require("@/controllers/UserController.js");
const router = new Router({ prefix: "/user" });
// controller: userController
/**
 *module user
 *action login
 *method post
 *@name ""
 **/
router.post("/login", async(ctx) => {
  await requestAction(ctx, Controller, "login");
});
/**
 *
 */
router.post("/profile", async(ctx) => {
  await requestAction(ctx, Controller, "profile");
});
/**
 *module user
 *action reg
 *method post
 *@name ""
 **/
router.post("/reg", async(ctx) => {
  await requestAction(ctx, Controller, "reg");
});
/**
 *module user
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module user
 *action findById
 *method get
 *@name ""
 **/
router.get("/find", async(ctx) => {
  await requestAction(ctx, Controller, "findById");
});
/**
 *module user
 *action update
 *method post
 *@name ""
 **/
router.post("/update", async(ctx) => {
  await requestAction(ctx, Controller, "update");
});
/**
 *module user
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  await requestAction(ctx, Controller, "del");
});
/**
 * func user/status
 *module user
 *action getLoginStatus
 *method get
 *@name ""
 **/
router.get("/status", async(ctx) => {
  await requestAction(ctx, Controller, "getLoginStatus");
});
/**
 *module user
 *action logout
 *method get
 *@name ""
 **/
router.get("/logout", async(ctx) => {
  await requestAction(ctx, Controller, "logout");
});
/**
 *module user
 *action loginByToken
 *method all
 *@name ""
 **/
router.all("/login_by_token", async(ctx) => {
  await requestAction(ctx, Controller, "loginByToken");
});
/**
 *module user
 *action getLdapAuth
 *method all
 *@name ""
 **/
router.all("/login_by_ldap", async(ctx) => {
  await requestAction(ctx, Controller, "getLdapAuth");
});
/**
 *module user
 *action upStudy
 *method get
 *@name ""
 **/
router.get("/up_study", async(ctx) => {
  await requestAction(ctx, Controller, "upStudy");
});
/**
 *module user
 *action changePassword
 *method post
 *@name ""
 **/
router.post("/change_password", async(ctx) => {
  await requestAction(ctx, Controller, "changePassword");
});
/**
 *module user
 *action search
 *method get
 *@name ""
 **/
router.get("/search", async(ctx) => {
  await requestAction(ctx, Controller, "search");
});
/**
 *module user
 *action project
 *method get
 *@name ""
 **/
router.get("/project", async(ctx) => {
  await requestAction(ctx, Controller, "project");
});
/**
 *module user
 *action avatar
 *method get
 *@name ""
 **/
router.get("/avatar", async(ctx) => {
  await requestAction(ctx, Controller, "avatar");
});
/**
 *module user
 *action uploadAvatar
 *method post
 *@name ""
 **/
router.post("/upload_avatar", async(ctx) => {
  await requestAction(ctx, Controller, "uploadAvatar");
});
//
module.exports = router;
