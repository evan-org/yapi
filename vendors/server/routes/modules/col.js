const yapi = require("@server/yapi.js");
const Router = require("@koa/router");
const router = new Router({ prefix: "/col" });
// controller: interfaceColController
const InterfaceColController = require("@server/controllers/InterfaceColController.js");
const requestAction = require("@server/utils/requestAction.js");
/**
 *module col
 *action addCol
 *method post
 *@name ""
 **/
router.post("/add_col", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "addCol");
});
/**
 *module col
 *action addCaseList
 *method post
 *@name ""
 **/
router.post("/add_case_list", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "addCaseList");
});
/**
 *module col
 *action cloneCaseList
 *method post
 *@name ""
 **/
router.post("/clone_case_list", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "cloneCaseList");
});
/**
 *module col
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "list");
});
/**
 *module col
 *action getCaseList
 *method get
 *@name ""
 **/
router.get("/case_list", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "getCaseList");
});
/**
 *module col
 *action getCaseListByVariableParams
 *method get
 *@name ""
 **/
router.get("/case_list_by_var_params", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "getCaseListByVariableParams");
});
/**
 *module col
 *action addCase
 *method post
 *@name ""
 **/
router.post("/add_case", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "addCase");
});
/**
 *module col
 *action upCase
 *method post
 *@name ""
 **/
router.post("/up_case", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "upCase");
});
/**
 *module col
 *action getCase
 *method get
 *@name ""
 **/
router.get("/case", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "getCase");
});
/**
 *module col
 *action upCol
 *method post
 *@name ""
 **/
router.post("/up_col", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "upCol");
});
/**
 *module col
 *action upCaseIndex
 *method post
 *@name ""
 **/
router.post("/up_case_index", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "upCaseIndex");
});
/**
 *module col
 *action upColIndex
 *method post
 *@name ""
 **/
router.post("/up_col_index", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "upColIndex");
});
/**
 *module col
 *action delCol
 *method get
 *@name ""
 **/
router.get("/del_col", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "delCol");
});
/**
 *module col
 *action delCase
 *method get
 *@name ""
 **/
router.get("/del_case", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "delCase");
});
/**
 *module col
 *action runCaseScript
 *method post
 *@name ""
 **/
router.post("/run_script", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "runCaseScript");
});
/**
 *module col
 *action getCaseEnvList
 *method get
 *@name ""
 **/
router.get("/case_env_list", async(ctx) => {
  await requestAction(ctx, InterfaceColController, "getCaseEnvList");
});
//
module.exports = router;
