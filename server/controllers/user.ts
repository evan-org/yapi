/**
 * 用户 HTTP 控制器（薄层：Cookie/重定向/权限 → Service）
 */
import jwt from "jsonwebtoken";
import yapi from "../runtime.js";
import type { YapiRuntime } from "../types/global.js";
import type { AppContext } from "../types/app-context.js";
import commons from "../utils/commons.js";
import baseController from "./base.js";
import { userService } from "../services/index.js";
import type { ServiceResult } from "../services/service-result.js";
import { replyServiceResult } from "./controller.util.js";

type UserActor = {
  role: string;
  currentUid: number | string;
};

/** 从 query 取单个标量（兼容 string | string[]） */
function queryScalar(
  value: string | string[] | undefined,
  fallback?: string | number
): string | number {
  if (Array.isArray(value)) {
    return value[0] ?? fallback ?? "";
  }
  return value ?? fallback ?? "";
}

class userController extends baseController {
  constructor(ctx: AppContext) {
    super(ctx);
  }

  /** 写入登录 Cookie */
  setLoginCookie(uid: number | string, passsalt: string) {
    const token = jwt.sign({ uid }, passsalt, { expiresIn: "7 days", algorithm: "HS256" });
    this.ctx.cookies.set("_yapi_token", token, {
      expires: commons.expireDate(7),
      httpOnly: true,
    });
    this.ctx.cookies.set("_yapi_uid", String(uid), {
      expires: commons.expireDate(7),
      httpOnly: true,
    });
  }

  _actor(): UserActor {
    return {
      role: this.getRole() || "",
      currentUid: this.getUid(),
    };
  }

  /** Service 结果 → HTTP 响应 */
  _reply(ctx: AppContext, result: ServiceResult<unknown>, successMsg?: string) {
    replyServiceResult(ctx, result, successMsg);
  }

  async login(ctx: AppContext) {
    const result = await userService.login(
      ctx.request.body as { email?: string; password?: string }
    );
    if (result.ok === false) {
      return this._reply(ctx, result);
    }
    const loginData = result.data as unknown as {
      cookie: { uid: number | string; passsalt: string };
      session: unknown;
    };
    this.setLoginCookie(loginData.cookie.uid, loginData.cookie.passsalt);
    ctx.body = commons.resReturn(loginData.session, 0, "logout success...");
  }

  async logout(ctx: AppContext) {
    ctx.cookies.set("_yapi_token", null);
    ctx.cookies.set("_yapi_uid", null);
    ctx.body = commons.resReturn("ok", 0, undefined);
  }

  async upStudy(ctx: AppContext) {
    this._reply(ctx, await userService.markStudyDone(this.getUid()));
  }

  async loginByToken(ctx: AppContext) {
    try {
      const hook = (yapi as YapiRuntime).emitHook;
      if (!hook) {
        throw new Error("third_login hook 未注册");
      }
      const ret = (await hook("third_login", ctx)) as unknown as {
        email: string;
        username: string;
      };
      const third = await userService.ensureThirdPartyUser(ret.email, ret.username);
      if (third.ok) {
        this.setLoginCookie(third.data.uid, third.data.passsalt);
        commons.log("login success", "info");
        ctx.redirect("/group");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      commons.log(message, "error");
      ctx.redirect("/");
    }
  }

  async getLdapAuth(ctx: AppContext) {
    const body = ctx.request.body as { email: string; password: string };
    const result = await userService.loginByLdap(body);
    if (result.ok === false) {
      return this._reply(ctx, result);
    }
    const ldapData = result.data as unknown as {
      cookie: { uid: number | string; passsalt: string };
      session: unknown;
    };
    this.setLoginCookie(ldapData.cookie.uid, ldapData.cookie.passsalt);
    ctx.body = commons.resReturn(ldapData.session, 0, "logout success...");
  }

  async changePassword(ctx: AppContext) {
    this._reply(
      ctx,
      await userService.changePassword(ctx.request.body as Record<string, unknown>, this._actor())
    );
  }

  async reg(ctx: AppContext) {
    const result = await userService.register(
      ctx.request.body as { username?: string; password?: string; email?: string }
    );
    if (result.ok === false) {
      return this._reply(ctx, result);
    }
    const regData = result.data as unknown as {
      cookie: { uid: number | string; passsalt: string };
      user: unknown;
    };
    this.setLoginCookie(regData.cookie.uid, regData.cookie.passsalt);
    ctx.body = commons.resReturn(regData.user, 0, undefined);
  }

  async list(ctx: AppContext) {
    const page = Number(queryScalar(ctx.request.query.page, 1));
    const limit = Number(queryScalar(ctx.request.query.limit, 10));
    this._reply(ctx, await userService.listPaged(page, limit));
  }

  async findById(ctx: AppContext) {
    const id = queryScalar(ctx.request.query.id);
    this._reply(ctx, await userService.findById(id, this._actor()));
  }

  async del(ctx: AppContext) {
    const body = ctx.request.body as { id?: number | string };
    this._reply(ctx, await userService.remove(body.id, this._actor()));
  }

  async update(ctx: AppContext) {
    this._reply(
      ctx,
      await userService.updateProfile(ctx.request.body as Record<string, unknown>, this._actor())
    );
  }

  async uploadAvatar(ctx: AppContext) {
    const body = ctx.request.body as { basecode?: string };
    this._reply(ctx, await userService.uploadAvatar(this.getUid(), body.basecode));
  }

  async avatar(ctx: AppContext) {
    const uidRaw = ctx.query.uid ? queryScalar(ctx.query.uid) : this.getUid();
    const result = await userService.getAvatarBuffer(uidRaw);
    if (result.ok === false) {
      ctx.body = "error:" + result.message;
      return;
    }
    ctx.set("Content-type", result.data.type);
    ctx.body = result.data.buffer;
  }

  async search(ctx: AppContext) {
    const q = String(queryScalar(ctx.request.query.q, ""));
    const result = await userService.search(q);
    if (result.ok === false) {
      return this._reply(ctx, result);
    }
    ctx.body = commons.resReturn(result.data, 0, "ok");
  }

  async project(ctx: AppContext) {
    const { id, type } = ctx.request.query;
    const result = await userService.loadNavigationChain(
      queryScalar(id),
      String(queryScalar(type, ""))
    );
    if (result.ok === false) {
      ctx.body = commons.resReturn({}, result.code, result.message);
      return;
    }
    const data = result.data as unknown as {
      project?: { _id: number | string; role?: string };
      group?: { _id: number | string; role?: string };
    };
    if (data.project) {
      const ownerAuth = await this.checkAuth(data.project._id, "project", "danger");
      if (ownerAuth) {
        data.project.role = "owner";
      } else if (await this.checkAuth(data.project._id, "project", "site")) {
        data.project.role = "dev";
      } else {
        data.project.role = "member";
      }
    }
    if (data.group) {
      const ownerAuth = await this.checkAuth(data.group._id, "group", "danger");
      if (ownerAuth) {
        data.group.role = "owner";
      } else if (await this.checkAuth(data.group._id, "group", "site")) {
        data.group.role = "dev";
      } else {
        data.group.role = "member";
      }
    }
    ctx.body = commons.resReturn(data, 0, undefined);
  }
}

export default userController;
