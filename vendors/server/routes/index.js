const combineRouters = require("koa-combine-routers");

const userRouter = require("./modules/user.js");


module.exports = combineRouters(userRouter)
