const Router = require("@koa/router");
const requestAction = require("@server/utils/requestAction.js");
//
const AdvMockController = require("@server/controllers/AdvMockController.js");
const StatisticsMockController = require("@server/controllers/StatisticsMockController.js");
const ExportDataController = require("@server/controllers/ExportDataController.js");
const ExportSwaggerController = require("@server/controllers/ExportSwaggerController.js");
const WikiController = require("@server/controllers/WikiController.js");
const SwaggerAutoSyncController = require("@server/controllers/SwaggerAutoSyncController.js");
//
const router = new Router({ prefix: "/plugin" });
//
/**
 *@controller AdvMockController
 *@action getMock
 *@method get
 *@name ""
 **/
router.get("/advmock/get", async(ctx) => {
  await requestAction(ctx, AdvMockController, "getMock");
});
/**
 *@controller AdvMockController
 *@action upMock
 *@method post
 *@name ""
 **/
router.post("/advmock/save", async(ctx) => {
  await requestAction(ctx, AdvMockController, "upMock");
});
/**
 *@controller AdvMockController
 *@action saveCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/save", async(ctx) => {
  await requestAction(ctx, AdvMockController, "saveCase");
});
/**
 *@controller AdvMockController
 *@action getCase
 *@method get
 *@name ""
 **/
router.get("/advmock/case/get", async(ctx) => {
  await requestAction(ctx, AdvMockController, "getCase");
});
/**
 *@controller AdvMockController
 *@action list
 *@method get
 *@name ""
 **/
router.get("/advmock/case/list", async(ctx) => {
  await requestAction(ctx, AdvMockController, "list");
});
/**
 *@controller AdvMockController
 *@action delCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/del", async(ctx) => {
  await requestAction(ctx, AdvMockController, "delCase");
});
/**
 *@controller AdvMockController
 *@action hideCase
 *@method post
 *@name ""
 **/
router.post("/advmock/case/hide", async(ctx) => {
  await requestAction(ctx, AdvMockController, "hideCase");
});
/* ******************************************************************************** */
/**
 *@controller StatisticsMockController
 *@action getStatisCount
 *@method get
 *@name ""
 **/
router.get("/statismock/count", async(ctx) => {
  await requestAction(ctx, StatisticsMockController, "getStatisCount");
});
/**
 *@controller StatisticsMockController
 *@action getMockDateList
 *@method get
 *@name ""
 **/
router.get("/statismock/get", async(ctx) => {
  await requestAction(ctx, StatisticsMockController, "getMockDateList");
});
/**
 *@controller StatisticsMockController
 *@action getSystemStatus
 *@method get
 *@name ""
 **/
router.get("/statismock/get_system_status", async(ctx) => {
  await requestAction(ctx, StatisticsMockController, "getSystemStatus");
});
/**
 *@controller StatisticsMockController
 *@action groupDataStats
 *@method get
 *@name ""
 **/
router.get("/statismock/group_data_stats", async(ctx) => {
  await requestAction(ctx, StatisticsMockController, "groupDataStats");
});
/* ******************************************************************************** */
/**
 *@controller ExportDataController
 *@action exportData
 *@method get
 *@name ""
 **/
router.get("/export", async(ctx) => {
  await requestAction(ctx, ExportDataController, "exportData");
});
/* ******************************************************************************** */
/**
 *@controller ExportSwaggerController
 *@action exportData
 *@method get
 *@name ""
 **/
router.get("/exportSwagger", async(ctx) => {
  await requestAction(ctx, ExportSwaggerController, "exportData");
});
/* ******************************************************************************** */
/**
 *@controller WikiController
 *@action getWikiDesc
 *@method get
 *@name ""
 **/
router.get("/wiki_desc/get", async(ctx) => {
  await requestAction(ctx, WikiController, "getWikiDesc");
});
/**
 *@controller WikiController
 *@action uploadWikiDesc
 *@method post
 *@name ""
 **/
router.post("/wiki_desc/up", async(ctx) => {
  await requestAction(ctx, WikiController, "uploadWikiDesc");
});
/* ******************************************************************************** */
/**
 *@controller SwaggerAutoSyncController
 *@action getSync
 *@method get
 *@name ""
 **/
router.get("/autoSync/get", async(ctx) => {
  await requestAction(ctx, SwaggerAutoSyncController, "getSync");
});
/**
 *@controller SwaggerAutoSyncController
 *@action upSync
 *@method post
 *@name ""
 **/
router.post("/autoSync/save", async(ctx) => {
  await requestAction(ctx, SwaggerAutoSyncController, "upSync");
});
//
module.exports = router;
