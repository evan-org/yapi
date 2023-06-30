const yapi = require("@server/yapi.js");
const Router = require("@koa/router");
const router = new Router({ prefix: "/col" });
// controller: interfaceColController
const InterfaceColController = require("@server/controllers/InterfaceColController.js");
//
async function ctxAction(ctx, Controller, action = "") {
  // const action = "addCol";
  if (!action) {
    ctx.body = yapi.commons.resReturn(null, 40011, "服务器出错...");
    return
  }
  try {
    const inst = new Controller(ctx);
    await inst.init(ctx);
    ctx.params = Object.assign({}, ctx.request.query, ctx.request.body, ctx.params);
    //
    if (inst.$auth === true) {
      await inst[action].call(inst, ctx);
    } else {
      ctx.body = yapi.commons.resReturn(null, 40011, "请登录...");
    }
  } catch (err) {
    ctx.body = yapi.commons.resReturn(null, 40011, "服务器出错...");
    yapi.commons.log(err, "error");
  }
}
/**
 *module col
 *action addCol
 *method post
 *@name ""
 **/
router.post("/add_col", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "addCol");
});
/**
 *module col
 *action addCaseList
 *method post
 *@name ""
 **/
router.post("/add_case_list", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "addCaseList");
});
/**
 *module col
 *action cloneCaseList
 *method post
 *@name ""
 **/
router.post("/clone_case_list", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "cloneCaseList");
});
/**
 *module col
 *action list
 *method get
 *@name ""
 **/
router.get("/list", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "list");
});
/**
 *module col
 *action getCaseList
 *method get
 *@name ""
 **/
router.get("/case_list", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "getCaseList");
});
/**
 *module col
 *action getCaseListByVariableParams
 *method get
 *@name ""
 **/
router.get("/case_list_by_var_params", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "getCaseListByVariableParams");
});
/**
 *module col
 *action addCase
 *method post
 *@name ""
 **/
router.post("/add_case", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "addCase");
});
/**
 *module col
 *action upCase
 *method post
 *@name ""
 **/
router.post("/up_case", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "upCase");
});
/**
 *module col
 *action getCase
 *method get
 *@name ""
 **/
router.get("/case", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "getCase");
});
/**
 *module col
 *action upCol
 *method post
 *@name ""
 **/
router.post("/up_col", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "upCol");
});
/**
 *module col
 *action upCaseIndex
 *method post
 *@name ""
 **/
router.post("/up_case_index", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "upCaseIndex");
});
/**
 *module col
 *action upColIndex
 *method post
 *@name ""
 **/
router.post("/up_col_index", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "upColIndex");
});
/**
 *module col
 *action delCol
 *method get
 *@name ""
 **/
router.get("/del_col", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "delCol");
});
/**
 *module col
 *action delCase
 *method get
 *@name ""
 **/
router.get("/del_case", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "delCase");
});
/**
 *module col
 *action runCaseScript
 *method post
 *@name ""
 **/
router.post("/run_script", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "runCaseScript");
});
/**
 *module col
 *action getCaseEnvList
 *method get
 *@name ""
 **/
router.get("/case_env_list", async(ctx) => {
  await ctxAction(ctx, InterfaceColController, "getCaseEnvList");
});
//
module.exports = router;
