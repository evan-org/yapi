const yapi = require("@/yapi.js");
//
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const sha1 = require("sha1");
//
/**
 * 生成盐值
 * */
const generatePasssalt = () => Math.random().toString(36).substr(2);
// 过期时间
const expireDate = 30;
// jwt 生成token
const generateJwtToken = (uid, passsalt) => {
  let token = jwt.sign({ uid: uid }, passsalt, { expiresIn: `${expireDate} days` });
  return { token: token, uid: uid }
}
// 加盐 生成密码 入数据库
const generatePassword = (password, passsalt) => sha1(password + sha1(passsalt));
// 创建加密算法
function aseEncode(data, password) {
  // 如下方法使用指定的算法与密码来创建cipher对象
  const cipher = crypto.createCipher("aes192", password);
  // 使用该对象的update方法来指定需要被加密的数据
  let crypted = cipher.update(data, "utf-8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};
// 创建解密算法
function aseDecode(data, password) {
  /*
   该方法使用指定的算法与密码来创建 decipher对象, 第一个算法必须与加密数据时所使用的算法保持一致;
   第二个参数用于指定解密时所使用的密码，其参数值为一个二进制格式的字符串或一个Buffer对象，该密码同样必须与加密该数据时所使用的密码保持一致
  */
  const decipher = crypto.createDecipher("aes192", password);
  /*
   第一个参数为一个Buffer对象或一个字符串，用于指定需要被解密的数据
   第二个参数用于指定被解密数据所使用的编码格式，可指定的参数值为 'hex', 'binary', 'base64'等，
   第三个参数用于指定输出解密数据时使用的编码格式，可选参数值为 'utf-8', 'ascii' 或 'binary';
  */
  let decrypted = decipher.update(data, "hex", "utf-8");
  decrypted += decipher.final("utf-8");
  return decrypted;
};
const defaultSalt = "abcde";
function getToken(token, uid) {
  if (!token) {
    throw new Error("token 不能为空")
  }
  yapi.WEBROOT_CONFIG.passsalt = yapi.WEBROOT_CONFIG.passsalt || defaultSalt;
  return aseEncode(uid + "|" + token, yapi.WEBROOT_CONFIG.passsalt)
}
function parseToken(token) {
  if (!token) {
    throw new Error("token 不能为空")
  }
  yapi.WEBROOT_CONFIG.passsalt = yapi.WEBROOT_CONFIG.passsalt || defaultSalt;
  let tokens;
  try {
    tokens = aseDecode(token, yapi.WEBROOT_CONFIG.passsalt)
  } catch (e) {
    console.error(e)
  }
  if (tokens && typeof tokens === "string" && tokens.indexOf("|") > 0) {
    tokens = tokens.split("|")
    return {
      uid: tokens[0],
      projectToken: tokens[1]
    }
  }
  return false;
}

//
module.exports = {
  generatePasssalt,
  generateJwtToken,
  generatePassword,
  getToken,
  parseToken
}
