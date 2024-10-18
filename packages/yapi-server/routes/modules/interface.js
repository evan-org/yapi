const Router = require("@koa/router");
const requestAction = require("@/utils/requestAction.js");
const Controller = require("@/controllers/InterfaceController.js");
const router = new Router({ prefix: "/interface" });
// controller: interfaceController
/**
 *module interface
 *action add
 *method post
 *@name ""
 **/
router.post("/add", async(ctx) => {
  await requestAction(ctx, Controller, "add");
});
/**
 *module interface
 *action downloadCrx
 *method get
 *@name ""
 **/
router.get("/download_crx", async(ctx) => {
  await requestAction(ctx, Controller, "downloadCrx");
});
/**
 *module interface
 *action getCatMenu
 *method get
 *@name ""
 **/
router.get("/getCatMenu", async(ctx) => {
  await requestAction(ctx, Controller, "getCatMenu");
});
/**
 *module interface
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, Controller, "list");
});
/**
 *module interface
 *action get
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  await requestAction(ctx, Controller, "get");
});
/**
 *module interface
 *action up
 *method post
 *@name ""
 **/
router.post("/up", async(ctx) => {
  await requestAction(ctx, Controller, "up");
});
/**
 *module interface
 *action del
 *method post
 *@name ""
 **/
router.post("/del", async(ctx) => {
  await requestAction(ctx, Controller, "del");
});
/**
 *module interface
 *action interUpload
 *method post
 *@name ""
 **/
router.post("/interUpload", async(ctx) => {
  await requestAction(ctx, Controller, "interUpload");
});
/**
 *module interface
 *action listByCat
 *method get
 *@name ""
 **/
router.get("/list_cat", async(ctx) => {
  await requestAction(ctx, Controller, "listByCat");
});
/**
 *module interface
 *action listByMenu
 *method get
 *@name ""
 **/
router.get("/list_menu", async(ctx) => {
  await requestAction(ctx, Controller, "listByMenu");
});
/**
 *module interface
 *action listByOpen
 *method get
 *@name ""
 **/
router.get("/list_open", async(ctx) => {
  await requestAction(ctx, Controller, "listByOpen");
});
/**
 *module interface
 *action addCat
 *method post
 *@name ""
 **/
router.post("/add_cat", async(ctx) => {
  await requestAction(ctx, Controller, "addCat");
});
/**
 *module interface
 *action upCat
 *method post
 *@name ""
 **/
router.post("/up_cat", async(ctx) => {
  await requestAction(ctx, Controller, "upCat");
});
/**
 *module interface
 *action delCat
 *method post
 *@name ""
 **/
router.post("/del_cat", async(ctx) => {
  await requestAction(ctx, Controller, "delCat");
});
/**
 *module interface
 *action getCustomField
 *method get
 *@name ""
 **/
router.get("/get_custom_field", async(ctx) => {
  await requestAction(ctx, Controller, "getCustomField");
});
/**
 *module interface
 *action save
 *method post
 *@name ""
 **/
router.post("/save", async(ctx) => {
  await requestAction(ctx, Controller, "save");
});
/**
 *module interface
 *action upIndex
 *method post
 *@name ""
 **/
router.post("/up_index", async(ctx) => {
  await requestAction(ctx, Controller, "upIndex");
});
/**
 *module interface
 *action upCatIndex
 *method post
 *@name ""
 **/
router.post("/up_cat_index", async(ctx) => {
  await requestAction(ctx, Controller, "upCatIndex");
});
/**
 * module interface
 * action schema2json
 * method post
 * @name ""
 **/
router.post("/schema2json", async(ctx) => {
  await requestAction(ctx, Controller, "schema2json");
});
//
module.exports = router;
