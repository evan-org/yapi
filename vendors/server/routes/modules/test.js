const Router = require("@koa/router");
const router = new Router({ prefix: "/test" });
//
/**
 *module test
 *action testPost
 *method post
 *@name ""
 **/
router.post("/post", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testGet
 *method get
 *@name ""
 **/
router.get("/get", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testPut
 *method put
 *@name ""
 **/
router.put("/put", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testDelete
 *method del
 *@name ""
 **/
router.del("/delete", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testHead
 *method head
 *@name ""
 **/
router.head("/head", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testOptions
 *method options
 *@name ""
 **/
router.options("/options", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testPatch
 *method patch
 *@name ""
 **/
router.patch("/patch", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testFilesUpload
 *method post
 *@name ""
 **/
router.post("/files/upload", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testSingleUpload
 *method post
 *@name ""
 **/
router.post("/single/upload", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testHttpCode
 *method post
 *@name ""
 **/
router.post("/http/code", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testRaw
 *method post
 *@name ""
 **/
router.post("/raw", async(ctx) => {
  ctx.body = "";
});
/**
 *module test
 *action testResponse
 *method get
 *@name ""
 **/
router.get("/response", async(ctx) => {
  ctx.body = "";
});
//
module.exports = router;
