const jwt = require("jsonwebtoken");
const yapi = require("@server/yapi.js");
const UserModel = require("@server/models/UserModel.js");
// 定义白名单路由
const whitelist = ["/login", "/public"];
/**
 * @param {{path:string}} ctx
 * @param next
 * */
const loginVerify = async(ctx, next) => {
  const { url, header } = ctx.request;
  // 检查是否在白名单中
  if (whitelist.includes(url)) {
    await next();
    return;
  }
  // 获取 JWT
  const token = header.authorization;
  const uid = header.uid;
  if (!token || !uid) {
    ctx.status = 401; // 未授权
    ctx.body = "Unauthorized";
    ctx.throw(401, "Unauthorized");
  }
  try {
    let userInst = yapi.getInst(UserModel); // 创建user实体
    let result = await userInst.findById(uid);
    if (!result) {
      ctx.status = 400; // 未授权
      ctx.body = "参数错误";
      ctx.throw(400, "参数错误");
    }
    // 验证 JWT
    const decoded = jwt.verify(token, result.passsalt);
    //
    if (decoded.uid === uid) {
      this.$uid = uid;
      this.$auth = true;
      this.$user = result;
      return true;
    }
    // 在上下文中保存用户信息
    ctx.state.user = decoded;
    await next();
  } catch (err) {
    ctx.status = 401; // 未授权
    ctx.body = "Unauthorized";
    return Promise.reject(err);
  }
}
module.exports = loginVerify;
