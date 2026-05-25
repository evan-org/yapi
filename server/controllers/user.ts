// @ts-nocheck
/**
 * 用户 HTTP 控制器（薄层：Cookie/重定向/权限 → Service）
 */
import jwt from "jsonwebtoken";
import yapi from "../runtime.js";
import baseController from "./base.js";
import { userService } from "../services/index.js";

class userController extends baseController {
  constructor(ctx) {
    super(ctx);
  }

  /** 写入登录 Cookie */
  setLoginCookie(uid, passsalt) {
    const token = jwt.sign({ uid }, passsalt, { expiresIn: "7 days" });
    this.ctx.cookies.set("_yapi_token", token, {
      expires: yapi.commons.expireDate(7),
      httpOnly: true,
    });
    this.ctx.cookies.set("_yapi_uid", uid, {
      expires: yapi.commons.expireDate(7),
      httpOnly: true,
    });
  }

  /** Service 结果 → HTTP 响应 */
  _reply(ctx, result, successMsg) {
    if (!result.ok) {
      ctx.body = yapi.commons.resReturn(null, result.code, result.message);
      return;
    }
    ctx.body = yapi.commons.resReturn(
      result.data,
      0,
      successMsg !== undefined ? successMsg : undefined
    );
  }

  async login(ctx) {
    const result = await userService.login(ctx.request.body);
    if (!result.ok) {
      return this._reply(ctx, result);
    }
    this.setLoginCookie(result.data.cookie.uid, result.data.cookie.passsalt);
    ctx.body = yapi.commons.resReturn(result.data.session, 0, "logout success...");
  }

  async logout(ctx) {
    ctx.cookies.set("_yapi_token", null);
    ctx.cookies.set("_yapi_uid", null);
    ctx.body = yapi.commons.resReturn("ok");
  }

  async upStudy(ctx) {
    this._reply(ctx, await userService.markStudyDone(this.getUid()));
  }

  async loginByToken(ctx) {
    try {
      const ret = await yapi.emitHook("third_login", ctx);
      const third = await userService.ensureThirdPartyUser(ret.email, ret.username);
      if (third.ok) {
        this.setLoginCookie(third.data.uid, third.data.passsalt);
        yapi.commons.log("login success");
        ctx.redirect("/group");
      }
    } catch (e) {
      yapi.commons.log(e.message, "error");
      ctx.redirect("/");
    }
  }

  async getLdapAuth(ctx) {
    const result = await userService.loginByLdap(ctx.request.body);
    if (!result.ok) {
      return this._reply(ctx, result);
    }
    this.setLoginCookie(result.data.cookie.uid, result.data.cookie.passsalt);
    ctx.body = yapi.commons.resReturn(result.data.session, 0, "logout success...");
  }

  async changePassword(ctx) {
    this._reply(
      ctx,
      await userService.changePassword(ctx.request.body, {
        role: this.getRole(),
        currentUid: this.getUid(),
      })
    );
  }

  async reg(ctx) {
    const result = await userService.register(ctx.request.body);
    if (!result.ok) {
      return this._reply(ctx, result);
    }
    this.setLoginCookie(result.data.cookie.uid, result.data.cookie.passsalt);
    ctx.body = yapi.commons.resReturn(result.data.user);
  }

  async list(ctx) {
    const page = ctx.request.query.page || 1;
    const limit = ctx.request.query.limit || 10;
    this._reply(ctx, await userService.listPaged(page, limit));
  }

  async findById(ctx) {
    this._reply(
      ctx,
      await userService.findById(ctx.request.query.id, {
        role: this.getRole(),
        currentUid: this.getUid(),
      })
    );
  }

  async del(ctx) {
    this._reply(
      ctx,
      await userService.remove(ctx.request.body.id, {
        role: this.getRole(),
        currentUid: this.getUid(),
      })
    );
  }

  async update(ctx) {
    this._reply(
      ctx,
      await userService.updateProfile(ctx.request.body, {
        role: this.getRole(),
        currentUid: this.getUid(),
      })
    );
  }

  async uploadAvatar(ctx) {
    this._reply(
      ctx,
      await userService.uploadAvatar(this.getUid(), ctx.request.body.basecode)
    );
  }

  async avatar(ctx) {
    const uid = ctx.query.uid ? ctx.query.uid : this.getUid();
    const result = await userService.getAvatarBuffer(uid);
    if (!result.ok) {
      ctx.body = "error:" + result.message;
      return;
    }
    ctx.set("Content-type", result.data.type);
    ctx.body = result.data.buffer;
  }

  async search(ctx) {
    const result = await userService.search(ctx.request.query.q);
    if (!result.ok) {
      return this._reply(ctx, result);
    }
    ctx.body = yapi.commons.resReturn(result.data, 0, "ok");
  }

  async project(ctx) {
    const { id, type } = ctx.request.query;
    const result = await userService.loadNavigationChain(id, type);
    if (!result.ok) {
      ctx.body = yapi.commons.resReturn({}, result.code, result.message);
      return;
    }
    const data = result.data;
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
    ctx.body = yapi.commons.resReturn(data);
  }
}

export default userController;
