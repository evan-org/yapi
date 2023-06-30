const Router = require("@koa/router");
const router = new Router({ prefix: "/plugin" });
//
/**
 *@controller AdvMockController
 *@action getMock
 *@method get
 *@name ""
 **/
router.get("/advmock/get", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action upMock
 *@method post
 *@name ""
 **/
router.post("/advmock/save", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action saveCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/save", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action getCase
 *@method get
 *@name ""
 **/
router.get("/advmock/case/get", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action list
 *@method get
 *@name ""
 **/
router.get("/advmock/case/list", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action delCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/del", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller AdvMockController
 *@action hideCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/hide", async(ctx) => {
  ctx.body = "";
});
/* ******************************************************************************** */
/**
 *@controller StatisticsMockController
 *@action getStatisCount
 *@method get
 *@name ""
 **/
router.get("/statismock/count", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller StatisticsMockController
 *@action getMockDateList
 *@method get
 *@name ""
 **/
router.get("/statismock/get", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller StatisticsMockController
 *@action getSystemStatus
 *@method get
 *@name ""
 **/
router.get("/statismock/get_system_status", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller StatisticsMockController
 *@action groupDataStats
 *@method get
 *@name ""
 **/
router.get("/statismock/group_data_stats", async(ctx) => {
  ctx.body = "";
});
/* ******************************************************************************** */
/**
 *@controller GenServicesController
 *@action exportData
 *@method get
 *@name ""
 **/
router.get("/export", async(ctx) => {
  ctx.body = "";
});
/* ******************************************************************************** */
/**
 *@controller ExportSwaggerController
 *@action exportData
 *@method get
 *@name ""
 **/
router.get("/exportSwagger", async(ctx) => {
  ctx.body = "";
});
/* ******************************************************************************** */
/**
 *@controller WikiController
 *@action getWikiDesc
 *@method get
 *@name ""
 **/
router.get("/wiki_desc/get", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller WikiController
 *@action uplodaWikiDesc
 *@method post
 *@name ""
 **/
router.post("/wiki_desc/up", async(ctx) => {
  ctx.body = "";
});
/* ******************************************************************************** */
/**
 *@controller SwaggerAutoSyncController
 *@action getSync
 *@method get
 *@name ""
 **/
router.get("/autoSync/get", async(ctx) => {
  ctx.body = "";
});
/**
 *@controller SwaggerAutoSyncController
 *@action upSync
 *@method post
 *@name ""
 **/
router.post("/autoSync/save", async(ctx) => {
  ctx.body = "";
});
//
module.exports = router;
