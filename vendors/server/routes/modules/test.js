const Router = require("@koa/router");
const requestAction = require("@server/utils/requestAction.js");
const Controller = require("@server/controllers/TestController.js");
const router = new Router({ prefix: "/test" });
// controller: testController
/**
 *module test
 *action testPost
 *method post
 *@name ""
 **/
router.post("/post", async(ctx) => {
  await requestAction(ctx, Controller, "testPost");
});
/**
 *module test
 *action testGet
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  await requestAction(ctx, Controller, "testGet");
});
/**
 *module test
 *action testPut
 *method put
 *@name ""
 **/
router.put("/put", async(ctx) => {
  await requestAction(ctx, Controller, "testPut");
});
/**
 *module test
 *action testDelete
 *method del
 *@name ""
 **/
router.del("/delete", async(ctx) => {
  await requestAction(ctx, Controller, "testDelete");
});
/**
 *module test
 *action testHead
 *method head
 *@name ""
 **/
router.head("/head", async(ctx) => {
  await requestAction(ctx, Controller, "testHead");
});
/**
 *module test
 *action testOptions
 *method options
 *@name ""
 **/
router.options("/options", async(ctx) => {
  await requestAction(ctx, Controller, "testOptions");
});
/**
 *module test
 *action testPatch
 *method patch
 *@name ""
 **/
router.patch("/patch", async(ctx) => {
  await requestAction(ctx, Controller, "testPatch");
});
/**
 *module test
 *action testFilesUpload
 *method post
 *@name ""
 **/
router.post("/files/upload", async(ctx) => {
  await requestAction(ctx, Controller, "testFilesUpload");
});
/**
 *module test
 *action testSingleUpload
 *method post
 *@name ""
 **/
router.post("/single/upload", async(ctx) => {
  await requestAction(ctx, Controller, "testSingleUpload");
});
/**
 *module test
 *action testHttpCode
 *method post
 *@name ""
 **/
router.post("/http/code", async(ctx) => {
  await requestAction(ctx, Controller, "testHttpCode");
});
/**
 *module test
 *action testRaw
 *method post
 *@name ""
 **/
router.post("/raw", async(ctx) => {
  await requestAction(ctx, Controller, "testRaw");
});
/**
 *module test
 *action testResponse
 *method get
 *@name ""
 **/
router.get("/response", async(ctx) => {
  await requestAction(ctx, Controller, "testResponse");
});
//
module.exports = router;
