const combineRouters = require("koa-combine-routers");
//
const colRouter = require("./modules/col.js");
const followRouter = require("./modules/follow.js");
const groupRouter = require("./modules/group.js");
const interfaceRouter = require("./modules/interface.js");
const logRouter = require("./modules/log.js");
const openRouter = require("./modules/open.js");
//
const pluginRouter = require("./modules/plugin.js");
//
const projectRouter = require("./modules/project.js");
const testRouter = require("./modules/test.js");
const userRouter = require("./modules/user.js");
//
// Combine the routers with the prefix
const router = combineRouters(...[
  colRouter.prefix("/api"),
  followRouter.prefix("/api"),
  groupRouter.prefix("/api"),
  interfaceRouter.prefix("/api"),
  logRouter.prefix("/api"),
  openRouter.prefix("/api"),
  pluginRouter.prefix("/api"),
  projectRouter.prefix("/api"),
  testRouter.prefix("/api"),
  userRouter.prefix("/api")
])
//
//
console.log("router-routes()", router());
module.exports = router;
