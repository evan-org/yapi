const fs = require("fs-extra");
const yapi = require("@server/yapi.js");
const commons = require("./utils/commons");
const mongodbModule = require("@server/helper/mongodb.js");
const userModel = require("@server/models/modules/user.js");
const mongoose = require("mongoose");
yapi.commons = commons;
yapi.connect = mongodbModule.connect();
//
function install() {
  let exist = yapi.commons.fileExist(yapi.path.join(yapi.WEBROOT_RUNTIME, "init.lock"));
  if (exist) {
    throw new Error(
      "init.lock文件已存在，请确认您是否已安装。如果需要重新安装，请删掉init.lock文件"
    );
  }
  setupSql();
}
function setupSql() {
  let userInst = yapi.getInst(userModel);
  let passsalt = yapi.commons.randStr();
  let result = userInst.save({
    username: yapi.WEBROOT_CONFIG.adminAccount.substring(0, yapi.WEBROOT_CONFIG.adminAccount.indexOf("@")),
    email: yapi.WEBROOT_CONFIG.adminAccount,
    password: yapi.commons.generatePassword("ymfe.org", passsalt),
    passsalt: passsalt,
    role: "admin",
    add_time: yapi.commons.time(),
    up_time: yapi.commons.time()
  });
  // 初始化数据库
  yapi.connect.then(function() {
    //
    const userCol = mongoose.connection.db.collection("user");
    userCol.createIndex({ username: 1 });
    userCol.createIndex({ email: 1 }, { unique: true });
    //
    const projectCol = mongoose.connection.db.collection("project");
    projectCol.createIndex({ uid: 1 });
    projectCol.createIndex({ name: 1 });
    projectCol.createIndex({ group_id: 1 });
    //
    const logCol = mongoose.connection.db.collection("log");
    logCol.createIndex({ uid: 1 });
    logCol.createIndex({ typeid: 1, type: 1 });
    //
    const interfaceColCol = mongoose.connection.db.collection("interface_col");
    interfaceColCol.createIndex({ uid: 1 });
    interfaceColCol.createIndex({ project_id: 1 });
    //
    const interfaceCatCol = mongoose.connection.db.collection("interface_cat");
    interfaceCatCol.createIndex({ uid: 1 });
    interfaceCatCol.createIndex({ project_id: 1 });
    //
    const interfaceCaseCol = mongoose.connection.db.collection("interface_case");
    interfaceCaseCol.createIndex({ uid: 1 });
    interfaceCaseCol.createIndex({ col_id: 1 });
    interfaceCaseCol.createIndex({ project_id: 1 });
    //
    const interfaceCol = mongoose.connection.db.collection("interface");
    interfaceCol.createIndex({ uid: 1 });
    interfaceCol.createIndex({ path: 1, method: 1 });
    interfaceCol.createIndex({ project_id: 1 });
    //
    const groupCol = mongoose.connection.db.collection("group");
    groupCol.createIndex({ uid: 1 });
    groupCol.createIndex({ group_name: 1 });
    //
    const avatarCol = mongoose.connection.db.collection("avatar");
    avatarCol.createIndex({ uid: 1 });
    //
    const tokenCol = mongoose.connection.db.collection("token");
    tokenCol.createIndex({ project_id: 1 });
    //
    const followCol = mongoose.connection.db.collection("follow");
    followCol.createIndex({ uid: 1 });
    followCol.createIndex({ project_id: 1 });
    //
    result.then(function() {
      fs.ensureFileSync(yapi.path.join(yapi.WEBROOT_RUNTIME, "init.lock"));
      console.log(`初始化管理员账号成功,账号名："${yapi.WEBROOT_CONFIG.adminAccount}"，密码："ymfe.org"`);
      process.exit(0);
    }, function(err) {
      throw new Error(`初始化管理员账号 "${yapi.WEBROOT_CONFIG.adminAccount}" 失败, ${err.message}`); // eslint-disable-line
    });
  }).catch(function(err) {
    throw new Error(err.message);
  });
}
install();
