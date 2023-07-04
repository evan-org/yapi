const jwt = require("jsonwebtoken");
const sha1 = require("sha1");
//
/**
 * 生成盐值
 * */
exports.generatePasssalt = () => Math.random().toString(36).substr(2);
// 过期时间
const expireDate = 30;
// jwt 生成token
exports.generateJwtToken = (uid, passsalt) => {
  let token = jwt.sign({ uid: uid }, passsalt, { expiresIn: `${expireDate} days` });
  return { token: token, uid: uid }
}
// 加盐 生成密码 入数据库
exports.generatePassword = (password, passsalt) => sha1(password + sha1(passsalt));
