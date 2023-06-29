const Router = require("@koa/router");
const router = new Router({ prefix: "/user" });
// controller: userController
/**
 *module user
 *action login
 *method post
 *@name ""
 **/
router.post("/login", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action reg
 *method post
 *@name ""
 **/
router.post("/reg", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action findById
 *method get
 *@name ""
 **/
router.get("/find", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action update
 *method post
 *@name ""
 **/
router.post("/update", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action getLoginStatus
 *method get
 *@name ""
 **/
router.get("/status", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action logout
 *method get
 *@name ""
 **/
router.get("/logout", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action loginByToken
 *method all
 *@name ""
 **/
router.all("/login_by_token", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action getLdapAuth
 *method all
 *@name ""
 **/
router.all("/login_by_ldap", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action upStudy
 *method get
 *@name ""
 **/
router.get("/up_study", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action changePassword
 *method post
 *@name ""
 **/
router.post("/change_password", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action search
 *method get
 *@name ""
 **/
router.get("/search", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action project
 *method get
 *@name ""
 **/
router.get("/project", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action avatar
 *method get
 *@name ""
 **/
router.get("/avatar", async(ctx) => {
  ctx.body = "";
});
/**
 *module user
 *action uploadAvatar
 *method post
 *@name ""
 **/
router.post("/upload_avatar", async(ctx) => {
  ctx.body = "";
});

//
module.exports = router;
