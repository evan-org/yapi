// @ts-nocheck
import fs from "fs-extra";

import yapi from "./runtime.js";

import commons from "./utils/commons.js";

import dbModule from "./utils/db.js";

import userModel from "./models/user.js";

yapi.commons = commons;
yapi.connect = dbModule.connect();

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
    username: yapi.WEBCONFIG.adminAccount.substr(0, yapi.WEBCONFIG.adminAccount.indexOf("@")),
    email: yapi.WEBCONFIG.adminAccount,
    password: yapi.commons.generatePassword("ymfe.org", passsalt),
    passsalt: passsalt,
    role: "admin",
    add_time: yapi.commons.time(),
    up_time: yapi.commons.time(),
  });

  yapi.connect
    .then(function() {
      result.then(
        function() {
          fs.ensureFileSync(yapi.path.join(yapi.WEBROOT_RUNTIME, "init.lock"));
          console.log(
            `初始化管理员账号成功,账号名："${yapi.WEBCONFIG.adminAccount}"，密码："ymfe.org"`
          ); // eslint-disable-line
          process.exit(0);
        },
        function(err) {
          throw new Error(`初始化管理员账号 "${yapi.WEBCONFIG.adminAccount}" 失败, ${err.message}`); // eslint-disable-line
        }
      );
    })
    .catch(function(err) {
      throw new Error(err.message);
    });
}

install();
