// @ts-nocheck
/**
 * 鉴权与会话：登录态、OpenAPI Token、项目/分组角色矩阵
 *
 * 从 controllers/base.ts 迁出，Controller 仅保留 HTTP 状态字段（$user/$auth）
 */
import _ from "underscore";
import jwt from "jsonwebtoken";
import type { AppContext } from "../types/app-context.js";
import { parseToken } from "../utils/token.js";
import { appLog } from "../utils/app-log.js";
import {
  canRegister as isRegistrationOpen,
  isLdapEnabled as isLdapLoginEnabled,
} from "../shared/config.js";
import commons from "../utils/commons.js";
import {
  projectRepository,
  userRepository,
  interfaceRepository,
  groupRepository,
  tokenRepository,
} from "../repositories/index.js";

/** Controller 上由 base 挂载的会话字段 */
export type ControllerSessionTarget = {
  $user: SessionUser | null;
  $auth?: boolean;
  $uid?: string | number;
  $tokenAuth?: boolean;
};

/** 登录用户会话字段 */
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
export type AuthAction = "danger" | "edit" | "view" | "site";
export type ProjectRole =
  | "admin"
  | "owner"
  | "dev"
  | "guest"
  | "member"
  | false;

const LOGIN_SKIP_ROUTES = [
  "/api/user/login_by_token",
  "/api/user/login",
  "/api/user/reg",
  "/api/user/status",
  "/api/user/logout",
  "/api/user/avatar",
  "/api/user/login_by_ldap",
];

const OPEN_API_ROUTES = [
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
  "/api/export/data",
  "/api/project/up",
  "/api/export/swagger",
];

const LEGACY_OPEN_TOKEN_UID = "999999";

type AuthActor = {
  uid: number;
  siteRole?: string;
};

class AuthService {
  shouldSkipLogin(path: string) {
    return LOGIN_SKIP_ROUTES.indexOf(path) > -1;
  }

  isOpenApiRoute(path: string) {
    return (
      OPEN_API_ROUTES.indexOf(path) > -1 || path.indexOf("/api/open/") === 0
    );
  }

  canRegister() {
    return isRegistrationOpen();
  }

  isLdapEnabled() {
    return isLdapLoginEnabled();
  }

  /**
   * 控制器 init 入口：Cookie 登录 + OpenAPI Token，写入 $user/$auth
   * @returns continue false 表示已设置 ctx.body（如 token 无效），应中止 action
   */
  async bootstrapControllerSession(
    ctrl: ControllerSessionTarget,
    ctx: AppContext
  ) {
    ctrl.$user = null;
    ctrl.$auth = undefined;
    ctrl.$tokenAuth = undefined;

    if (this.shouldSkipLogin(ctx.path)) {
      ctrl.$auth = true;
      return { continue: true };
    }

    const loginResult = await this.checkLogin(ctx);
    if (loginResult.ok) {
      ctrl.$uid = loginResult.uid;
      ctrl.$auth = true;
      ctrl.$user = loginResult.user;
    }

    const openAuth = await this.resolveOpenApiAuth(ctx);
    if (openAuth.invalidToken) {
      ctx.body = commons.resReturn(null, 42014, "token 无效");
      return { continue: false };
    }
    if (openAuth.ok) {
      ctrl.$tokenAuth = openAuth.tokenAuth;
      ctrl.$uid = openAuth.uid;
      ctrl.$user = openAuth.user;
      ctrl.$auth = true;
    }

    return { continue: true };
  }

  async getProjectIdByToken(token: string) {
    const row = await tokenRepository.findId(token);
    if (row) {
      return row.project_id as number | string;
    }
  }

  /**
   * Cookie 登录态校验
   */
  async checkLogin(ctx: AppContext) {
    const token = ctx.cookies.get("_yapi_token");
    const uid = ctx.cookies.get("_yapi_uid");
    try {
      if (!token || !uid) {
        return { ok: false };
      }
      const user = (await userRepository.findById(uid)) as SessionUser | null;
      if (!user) {
        return { ok: false };
      }

      let decoded: jwt.JwtPayload | string;
      try {
        decoded = jwt.verify(token, user.passsalt as string, {
          algorithms: ["HS256"],
        });
      } catch (err) {
        return { ok: false };
      }

      if (typeof decoded !== "string" && decoded.uid == uid) {
        return { ok: true, uid, user };
      }
      return { ok: false };
    } catch (e) {
      appLog(e, "error");
      return { ok: false };
    }
  }

  /**
   * OpenAPI project token 鉴权（写入 ctx.query.pid / params.project_id）
   */
  async resolveOpenApiAuth(ctx: AppContext) {
    const params = Object.assign({}, ctx.query, ctx.request.body) as Record<
      string,
      unknown
    >;
    const token = params.token;
    if (
      !token ||
      typeof token !== "string" ||
      !this.isOpenApiRoute(ctx.path)
    ) {
      return { ok: false };
    }

    const tokens = parseToken(token);
    let projectToken = token;
    let tokenUid: string | number = LEGACY_OPEN_TOKEN_UID;

    if (!tokens) {
      const checkId = await this.getProjectIdByToken(token);
      if (!checkId) {
        return { ok: false };
      }
    } else {
      projectToken = tokens.projectToken;
      tokenUid = tokens.uid;
    }

    const checkId = await this.getProjectIdByToken(projectToken);
    if (!checkId) {
      return { ok: false, invalidToken: true };
    }

    const projectData = await projectRepository.get(checkId);
    if (!projectData) {
      return { ok: false, invalidToken: true };
    }

    const pid = String(checkId);
    ctx.query.pid = pid;
    (ctx.params as Record<string, unknown>).project_id = checkId;

    let user: SessionUser;
    if (String(tokenUid) === LEGACY_OPEN_TOKEN_UID) {
      user = {
        _id: tokenUid,
        role: "member",
        username: "system",
      };
    } else {
      user = (await userRepository.findById(tokenUid)) as SessionUser;
    }

    return {
      ok: true,
      uid: tokenUid,
      user,
      tokenAuth: true,
    };
  }

  /**
   * 解析用户在 interface / project / group 上的有效角色
   */
  async getProjectRole(
    actor: AuthActor,
    id: number | string,
    type: ProjectRoleType
  ): Promise<ProjectRole> {
    try {
      if (actor.siteRole === "admin") {
        return "admin";
      }

      if (type === "interface") {
        const interfaceData = await interfaceRepository.get(id);
        if (interfaceData.uid === actor.uid) {
          return "owner";
        }
        type = "project";
        id = interfaceData.project_id;
      }

      if (type === "project") {
        const projectData = await projectRepository.get(id);
        if (projectData.uid === actor.uid) {
          return "owner";
        }
        const memberData = _.find(
          projectData.members,
          (m: { uid?: number; role?: string }) => m && m.uid === actor.uid
        );
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
        if (groupData.uid === actor.uid) {
          return "owner";
        }
        const groupMemberData = _.find(
          groupData.members,
          (m: { uid?: number; role?: string }) => m.uid === actor.uid
        );
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
      appLog(e, "error");
      return false;
    }
  }

  /**
   * 角色是否允许执行 action（纯函数，便于单测）
   */
  checkActionAllowed(role: ProjectRole, action: AuthAction) {
    if (action === "danger") {
      return role === "admin" || role === "owner";
    }
    if (action === "edit") {
      return role === "admin" || role === "owner" || role === "dev";
    }
    if (action === "view") {
      return (
        role === "admin" ||
        role === "owner" ||
        role === "dev" ||
        role === "guest"
      );
    }
    return false;
  }
}

export default new AuthService();
