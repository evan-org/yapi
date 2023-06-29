const combineRouters = require("koa-combine-routers");

const userRouter = require("./modules/user.js");
const groupRouter = require("./modules/group.js");

const router = combineRouters(userRouter, groupRouter)
//
console.log("router1routes()", router());
module.exports = router;
