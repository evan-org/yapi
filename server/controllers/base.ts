/**
 * 控制器基类（controllers/ 目录）
 * 负责挂载会话状态；鉴权逻辑在 services/auth.service.ts
 */
import type { AppContext } from "../types/app-context.js";
import commons from "../utils/commons.js";
import authService, {
  type SessionUser,
  type ProjectRoleType,
  type AuthAction,
  type ProjectRole,
} from "../services/auth.service.js";

export type { SessionUser, ProjectRoleType, AuthAction, ProjectRole };

class baseController {
  ctx: AppContext;
  $user: SessionUser | null;
  $auth?: boolean;
  $uid?: string | number;
  $tokenAuth?: boolean;
  schemaMap?: Record<string, unknown>;
  roles: Record<string, string>;

  constructor(ctx: AppContext) {
    this.ctx = ctx;
    this.$user = null;
    this.roles = {
      admin: "Admin",
      member: "网站会员",
    };
  }

  async init(ctx: AppContext) {
    await authService.bootstrapControllerSession(this, ctx);
  }

  getUid() {
    return parseInt(String(this.$uid), 10);
  }

  async checkLogin(ctx: AppContext) {
    const result = await authService.checkLogin(ctx);
    if (result.ok) {
      this.$uid = result.uid;
      this.$auth = true;
      this.$user = result.user;
      return true;
    }
    return false;
  }

  async checkRegister() {
    return authService.canRegister();
  }

  async checkLDAP() {
    return authService.isLdapEnabled();
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
      body = commons.resReturn(null, 40011, "请登录...") as Record<
        string,
        unknown
      >;
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

  async getProjectRole(
    id: number | string,
    type: ProjectRoleType
  ): Promise<ProjectRole> {
    return authService.getProjectRole(
      { uid: this.getUid(), siteRole: this.getRole() },
      id,
      type
    );
  }

  async checkAuth(id: number | string, type: ProjectRoleType, action: AuthAction) {
    const role = await this.getProjectRole(id, type);
    return authService.checkActionAllowed(role, action);
  }
}

export default baseController;
