const yapi = require("@server/yapi.js");
//
const ProjectModel = require("@server/models/ProjectModel.js");
const UserModel = require("@server/models/UserModel.js");
const InterfaceModel = require("@server/models/InterfaceModel.js");
const GroupModel = require("@server/models/GroupModel.js");
const TokenModel = require("@server/models/TokenModel.js");
//
const _ = require("underscore");
const jwt = require("jsonwebtoken");
const responseAction = require("@server/utils/responseAction.js");
const { parseToken } = require("../utils/sso.js");
// 不需要登录校验的API
const whiteList = [
  "/api/user/login_by_token",
  "/api/user/login",
  "/api/user/reg",
  "/api/user/status",
  "/api/user/logout",
  "/api/user/avatar",
  "/api/user/login_by_ldap"
];
class BaseController {
  constructor(ctx) {
    this.ctx = ctx;
    // 网站上线后，role对象key是不能修改的，value可以修改
    this.roles = {
      admin: "Admin",
      member: "网站会员"
    };
  }
  async init(ctx) {
    this.$user = null;
    //
    console.debug(ctx);
    if (whiteList.indexOf(ctx.path) > -1) {
      this.$auth = true;
    } else {
      await this.checkLogin(ctx);
    }
    // openAPI 不需要任何权限
    const openApiRouteWhiteList = [
      "/api/open/run_auto_test",
      "/api/open/import_data",
      "/api/interface/add",
      "/api/interface/save",
      "/api/interface/up",
      "/api/interface/get",
      "/api/interface/list",
      "/api/interface/list_menu",
      "/api/interface/add_cat",
      "/api/interface/getCatMenu",
      "/api/interface/list_cat",
      "/api/project/get",
      "/api/plugin/export",
      "/api/project/up",
      "/api/plugin/exportSwagger"
    ];
    //
    let params = Object.assign({}, ctx.query, ctx.request.body);
    let token = params.token;
    // 如果前缀是 /api/open，执行 parse token 逻辑
    if (token && typeof token === "string" && (openApiRouteWhiteList.indexOf(ctx.path) > -1 || ctx.path.indexOf("/api/open/") === 0)) {
      let tokens = parseToken(token)
      const oldTokenUid = "999999"
      let tokenUid = oldTokenUid;
      if (!tokens) {
        let checkId = await this.getProjectIdByToken(token);
        if (!checkId) {
          return;
        }
      } else {
        token = tokens.projectToken;
        tokenUid = tokens.uid;
      }
      let checkId = await this.getProjectIdByToken(token);
      if (!checkId) {
        ctx.body = yapi.commons.resReturn(null, 42014, "token 无效");
      }
      const projectInsert = yapi.getInst(ProjectModel);
      let projectData = await projectInsert.get(checkId);
      if (projectData) {
        ctx.query.pid = checkId; // 兼容：/api/plugin/export
        ctx.params.project_id = checkId;
        this.$tokenAuth = true;
        this.$uid = tokenUid;
        let result;
        if (tokenUid === oldTokenUid) {
          result = { _id: tokenUid, role: "member", username: "system" }
        } else {
          const userInsert = yapi.getInst(UserModel);
          result = await userInsert.findById(tokenUid);
        }
        this.$user = result;
        this.$auth = true;
      }
    }
  }
  async getProjectIdByToken(token) {
    const tokenInsert = yapi.getInst(TokenModel);
    let projectId = await tokenInsert.findId(token);
    if (projectId) {
      return projectId.toObject().project_id;
    }
  }
  getUid() {
    return parseInt(this.$uid, 10);
  }
  async checkLogin(ctx) {
    const { authorization, "user-id": uid } = ctx.headers;
    if (!(authorization && uid)) {
      return false
    }
    const token = authorization.split(" ")[1];
    //
    try {
      if (!token || !uid) {
        return false;
      }
      const userInsert = yapi.getInst(UserModel);
      const result = await userInsert.findById(uid);
      console.log("BaseController.js ---> userInsert.findById", result);
      if (!result) {
        return false;
      }
      let decoded;
      try {
        decoded = jwt.verify(token, result.passsalt);
      } catch (err) {
        return false;
      }
      if (decoded.uid.toString() === uid) {
        this.$uid = uid;
        this.$auth = true;
        this.$user = result;
        return true;
      }
      return false;
    } catch (e) {
      yapi.commons.log(e, "error");
      return false;
    }
  }
  async checkRegister() {
    // console.log('config', yapi.WEBROOT_CONFIG);
    return !yapi.WEBROOT_CONFIG.closeRegister;
  }
  async checkLDAP() {
    // console.log('config', yapi.WEBROOT_CONFIG);
    if (!yapi.WEBROOT_CONFIG.ldapLogin) {
      return false;
    } else {
      return yapi.WEBROOT_CONFIG.ldapLogin.enable || false;
    }
  }
  /**
   * func router user/status
   * 通用方法返回登录信息
   * @param {*} ctx
   */
  async getLoginStatus(ctx) {
    let body = {};
    const bool = await this.checkLogin(ctx);
    if (bool) {
      const result = yapi.commons.fieldSelect(this.$user, [
        "_id",
        "username",
        "email",
        "up_time",
        "add_time",
        "role",
        "type",
        "study"
      ]);
      body = responseAction(result, 0, "login success");
    } else {
      body = responseAction(null, 40011, "未登录...");
    }
    body.ladp = await this.checkLDAP();
    body.canRegister = await this.checkRegister();
    return (ctx.body = body);
  }
  getRole() {
    return this.$user.role;
  }
  getUsername() {
    return this.$user.username;
  }
  getEmail() {
    return this.$user.email;
  }
  async getProjectRole(id, type) {
    let result = {};
    try {
      if (this.getRole() === "admin") {
        return "admin";
      }
      if (type === "interface") {
        let interfaceInsert = yapi.getInst(InterfaceModel);
        let interfaceData = await interfaceInsert.get(id);
        result.interfaceData = interfaceData;
        // 项目创建者相当于 owner
        if (interfaceData.uid === this.getUid()) {
          return "owner";
        }
        type = "project";
        id = interfaceData.project_id;
      }
      if (type === "project") {
        const projectInsert = yapi.getInst(ProjectModel);
        let projectData = await projectInsert.get(id);
        if (projectData.uid === this.getUid()) {
          // 建立项目的人
          return "owner";
        }
        let memberData = _.find(projectData.members, (m) => {
          if (m && m.uid === this.getUid()) {
            return true;
          }
        });
        if (memberData && memberData.role) {
          if (memberData.role === "owner") {
            return "owner";
          } else if (memberData.role === "dev") {
            return "dev";
          } else {
            return "guest";
          }
        }
        type = "group";
        id = projectData.group_id;
      }
      if (type === "group") {
        let groupInsert = yapi.getInst(GroupModel);
        let groupData = await groupInsert.get(id);
        // 建立分组的人
        if (groupData.uid === this.getUid()) {
          return "owner";
        }
        let groupMemberData = _.find(groupData.members, (m) => {
          if (m.uid === this.getUid()) {
            return true;
          }
        });
        if (groupMemberData && groupMemberData.role) {
          if (groupMemberData.role === "owner") {
            return "owner";
          } else if (groupMemberData.role === "dev") {
            return "dev";
          } else {
            return "guest";
          }
        }
      }
      return "member";
    } catch (e) {
      yapi.commons.log(e, "error");
      return false;
    }
  }
  /**
   * 身份验证
   * @param {*} id type对应的id
   * @param {*} type enum[interface, project, group]
   * @param {*} action enum[ danger, edit, view ] danger只有owner或管理员才能操作,edit只要是dev或以上就能执行
   */
  async checkAuth(id, type, action) {
    let role = await this.getProjectRole(id, type);
    if (action === "danger") {
      if (role === "admin" || role === "owner") {
        return true;
      }
    } else if (action === "edit") {
      if (role === "admin" || role === "owner" || role === "dev") {
        return true;
      }
    } else if (action === "view") {
      if (role === "admin" || role === "owner" || role === "dev" || role === "guest") {
        return true;
      }
    }
    return false;
  }
}
module.exports = BaseController;
