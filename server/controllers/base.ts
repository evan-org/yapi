/**
 * 控制器基类（controllers/ 目录）
 * 负责登录态、权限与通用 model 实例；业务控制器继承此类
 */
import type { AppContext } from "../types/app-context.js";
import yapi from "../runtime.js";
import commons from "../utils/commons.js";
import {
  projectRepository,
  userRepository,
  interfaceRepository,
  groupRepository,
  tokenRepository,
} from "../repositories/index.js";
import _ from "underscore";
import jwt from "jsonwebtoken";
import { parseToken } from "../utils/token.js";

/** 登录用户会话字段（与 user 模型 findById 返回一致） */
export type SessionUser = {
  _id?: unknown;
  uid?: number;
  role?: string;
  username?: string;
  email?: string;
  passsalt?: string;
  up_time?: unknown;
  add_time?: unknown;
  type?: unknown;
  study?: unknown;
  [key: string]: unknown;
};

export type ProjectRoleType = "interface" | "project" | "group";
export type AuthAction = "danger" | "edit" | "view";
export type ProjectRole = "admin" | "owner" | "dev" | "guest" | "member" | false;

class baseController {
  ctx: AppContext;
  $user: SessionUser | null;
  $auth?: boolean;
  $uid?: string | number;
  $tokenAuth?: boolean;
  schemaMap?: Record<string, unknown>;
  tokenModel: typeof tokenRepository;
  projectModel: typeof projectRepository;
  roles: Record<string, string>;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
    this.$user = null;
    // 网站上线后，role对象key是不能修改的，value可以修改
    this.roles = {
      admin: "Admin",
      member: "网站会员",
    };
    this.tokenModel = tokenRepository;
    this.projectModel = projectRepository;
  }

  async init(ctx: AppContext) {
    this.$user = null;
    this.tokenModel = tokenRepository;
    this.projectModel = projectRepository;
    const ignoreRouter = [
      "/api/user/login_by_token",
      "/api/user/login",
      "/api/user/reg",
      "/api/user/status",
      "/api/user/logout",
      "/api/user/avatar",
      "/api/user/login_by_ldap",
    ];
    if (ignoreRouter.indexOf(ctx.path) > -1) {
      this.$auth = true;
    } else {
      await this.checkLogin(ctx);
    }

    const openApiRouter = [
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
      "/api/plugin/exportSwagger",
    ];

    const params = Object.assign({}, ctx.query, ctx.request.body) as Record<string, unknown>;
    const token = params.token;

    // 如果前缀是 /api/open，执行 parse token 逻辑
    if (
      token &&
      typeof token === "string" &&
      (openApiRouter.indexOf(ctx.path) > -1 || ctx.path.indexOf("/api/open/") === 0)
    ) {
      const tokens = parseToken(token);

      const oldTokenUid = "999999";

      let projectToken = token;
      let tokenUid: string | number = oldTokenUid;

      if (!tokens) {
        const checkId = await this.getProjectIdByToken(token);
        if (!checkId) {
          return;
        }
      } else {
        projectToken = tokens.projectToken;
        tokenUid = tokens.uid;
      }

      const checkId = await this.getProjectIdByToken(projectToken);
      if (!checkId) {
        ctx.body = commons.resReturn(null, 42014, "token 无效");
      }
      const projectData = await this.projectModel.get(checkId);
      if (projectData) {
        const pid = String(checkId);
        ctx.query.pid = pid; // 兼容：/api/plugin/export
        (ctx.params as Record<string, unknown>).project_id = checkId;
        this.$tokenAuth = true;
        this.$uid = tokenUid;
        let result: SessionUser;
        if (String(tokenUid) === oldTokenUid) {
          result = {
            _id: tokenUid,
            role: "member",
            username: "system",
          };
        } else {
          result = (await userRepository.findById(tokenUid)) as SessionUser;
        }

        this.$user = result;
        this.$auth = true;
      }
    }
  }

  async getProjectIdByToken(token: string) {
    const projectId = await this.tokenModel.findId(token);
    if (projectId) {
      return projectId.toObject().project_id as number | string;
    }
  }

  getUid() {
    return parseInt(String(this.$uid), 10);
  }

  async checkLogin(ctx: AppContext) {
    const token = ctx.cookies.get("_yapi_token");
    const uid = ctx.cookies.get("_yapi_uid");
    try {
      if (!token || !uid) {
        return false;
      }
      const result = (await userRepository.findById(uid)) as SessionUser | null;
      if (!result) {
        return false;
      }

      let decoded: jwt.JwtPayload | string;
      try {
        decoded = jwt.verify(token, result.passsalt as string, { algorithms: ["HS256"] });
      } catch (err) {
        return false;
      }

      if (typeof decoded !== "string" && decoded.uid == uid) {
        this.$uid = uid;
        this.$auth = true;
        this.$user = result;
        return true;
      }

      return false;
    } catch (e) {
      commons.log(e, "error");
      return false;
    }
  }

  async checkRegister() {
    if (yapi.WEBCONFIG.closeRegister) {
      return false;
    }
    return true;
  }

  async checkLDAP() {
    const ldapLogin = yapi.WEBCONFIG.ldapLogin as { enable?: boolean } | undefined;
    if (!ldapLogin) {
      return false;
    }
    return ldapLogin.enable || false;
  }

  async getLoginStatus(ctx: AppContext) {
    let body: Record<string, unknown>;
    if ((await this.checkLogin(ctx)) === true) {
      const result = commons.fieldSelect(this.$user, [
        "_id",
        "username",
        "email",
        "up_time",
        "add_time",
        "role",
        "type",
        "study",
      ]);
      body = commons.resReturn(result, 0, undefined) as Record<string, unknown>;
    } else {
      body = commons.resReturn(null, 40011, "请登录...") as Record<string, unknown>;
    }

    body.ladp = await this.checkLDAP();
    body.canRegister = await this.checkRegister();
    ctx.body = body;
  }

  getRole() {
    return this.$user?.role;
  }

  getUsername() {
    return this.$user?.username;
  }

  getEmail() {
    return this.$user?.email;
  }

  async getProjectRole(id: number | string, type: ProjectRoleType): Promise<ProjectRole> {
    try {
      if (this.getRole() === "admin") {
        return "admin";
      }
      if (type === "interface") {
        const interfaceData = await interfaceRepository.get(id);
        if (interfaceData.uid === this.getUid()) {
          return "owner";
        }
        type = "project";
        id = interfaceData.project_id;
      }

      if (type === "project") {
        const projectData = await projectRepository.get(id);
        if (projectData.uid === this.getUid()) {
          return "owner";
        }
        const memberData = _.find(projectData.members, (m: { uid?: number; role?: string }) => {
          if (m && m.uid === this.getUid()) {
            return true;
          }
        });

        if (memberData && memberData.role) {
          if (memberData.role === "owner") {
            return "owner";
          }
          if (memberData.role === "dev") {
            return "dev";
          }
          return "guest";
        }
        type = "group";
        id = projectData.group_id;
      }

      if (type === "group") {
        const groupData = await groupRepository.get(id);
        if (groupData.uid === this.getUid()) {
          return "owner";
        }

        const groupMemberData = _.find(groupData.members, (m: { uid?: number; role?: string }) => {
          if (m.uid === this.getUid()) {
            return true;
          }
        });
        if (groupMemberData && groupMemberData.role) {
          if (groupMemberData.role === "owner") {
            return "owner";
          }
          if (groupMemberData.role === "dev") {
            return "dev";
          }
          return "guest";
        }
      }

      return "member";
    } catch (e) {
      commons.log(e, "error");
      return false;
    }
  }

  /**
   * 身份验证
   * @param id type对应的id
   * @param type enum[interface, project, group]
   * @param action enum[ danger, edit, view ] danger只有owner或管理员才能操作,edit只要是dev或以上就能执行
   */
  async checkAuth(id: number | string, type: ProjectRoleType, action: AuthAction) {
    const role = await this.getProjectRole(id, type);

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

export default baseController;
