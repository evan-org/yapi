// @ts-nocheck
/**
 * 用户模块：登录、注册与密码
 */
import yapi from "../../runtime.js";
import commons from "../../utils/commons.js";
import { nowSeconds } from "../../shared/clock.js";
import { ldapQuery } from "../../utils/ldap.js";
import { ok, fail } from "../service-result.js";
import {
  validateLoginCredentials,
  validateChangePasswordParams,
  validateRegisterFields,
  resolveLdapIdentity,
  type LdapLoginConfig,
} from "../user.validation.js";
import { repos, errorMessage, toSessionUser } from "./shared.js";
import { createPrivateGroup } from "./group.js";

const { userModel } = repos;

export async function login(credentials: { email?: string; password?: string }) {
  const validated = validateLoginCredentials(credentials);
  if (!validated.ok) {
    return validated;
  }
  const { email, password } = validated.data;
  const user = await userModel.findByEmail(email);
  if (!user) {
    return fail(404, "该用户不存在");
  }
  if (commons.generatePassword(password, user.passsalt) !== user.password) {
    return fail(405, "密码错误");
  }
  return ok({
    session: toSessionUser(user),
    cookie: { uid: user._id, passsalt: user.passsalt },
  });
}

export async function loginByLdap(credentials: { email: string; password: string }) {
  try {
    const { email, password } = credentials;
    const ldapResult = (await ldapQuery(email, password)) as {
      info: Record<string, string>;
    };
    const ldapLogin = (yapi.WEBCONFIG.ldapLogin || {}) as LdapLoginConfig;
    const { emailParams, username } = resolveLdapIdentity(
      email,
      ldapResult.info,
      ldapLogin
    );
    const third = await ensureThirdPartyUser(emailParams, username);
    if (!third.ok) {
      return third;
    }
    const user = await userModel.findByEmail(emailParams);
    return ok({
      session: toSessionUser(user, user.type || "third"),
      cookie: { uid: user._id, passsalt: user.passsalt },
    });
  } catch (e) {
    commons.log(errorMessage(e), "error");
    return fail(401, errorMessage(e));
  }
}

export async function ensureThirdPartyUser(email: string, username: string) {
  try {
    let user = await userModel.findByEmail(email);
    if (!user || !user._id) {
      const passsalt = commons.randStr();
      const data = {
        username,
        password: commons.generatePassword(passsalt, passsalt),
        email,
        passsalt,
        role: "member",
        add_time: nowSeconds(),
        up_time: nowSeconds(),
        type: "third",
      };
      user = await userModel.save(data);
      await createPrivateGroup(user._id);
      commons.sendMail(
        {
          to: email,
          contents: `<h3>亲爱的用户：</h3><p>您好，感谢使用YApi平台，你的邮箱账号是：${email}</p>`,
        },
        () => {}
      );
    }
    return ok({ uid: user._id, passsalt: user.passsalt, user });
  } catch (e) {
    console.error("third_login:", errorMessage(e)); // eslint-disable-line
    return fail(401, `third_login: ${errorMessage(e)}`);
  }
}

export async function changePassword(
  params: { uid?: number | string; password?: string; old_password?: string },
  actor: import("./shared.js").UserActor
) {
  const validated = validateChangePasswordParams(params);
  if (!validated.ok) {
    return validated;
  }
  const user = await userModel.findById(validated.data.uid);
  if (actor.role !== "admin" && validated.data.uid != actor.currentUid) {
    return fail(402, "没有权限");
  }
  if (actor.role !== "admin" || user.role === "admin") {
    if (!validated.data.old_password) {
      return fail(400, "旧密码不能为空");
    }
    if (
      commons.generatePassword(validated.data.old_password, user.passsalt) !==
      user.password
    ) {
      return fail(402, "旧密码错误");
    }
  }
  const passsalt = commons.randStr();
  try {
    const result = await userModel.update(validated.data.uid, {
      up_time: nowSeconds(),
      password: commons.generatePassword(validated.data.password, passsalt),
      passsalt,
    });
    return ok(result);
  } catch (e) {
    return fail(401, errorMessage(e));
  }
}

export async function register(params: {
  username?: string;
  password?: string;
  email?: string;
}) {
  if (yapi.WEBCONFIG.closeRegister) {
    return fail(400, "禁止注册，请联系管理员");
  }
  const validated = validateRegisterFields(params);
  if (!validated.ok) {
    return validated;
  }
  const { email, password, username } = validated.data;
  const checkRepeat = await userModel.checkRepeat(email);
  if (checkRepeat > 0) {
    return fail(401, "该email已经注册");
  }
  const passsalt = commons.randStr();
  const data: Record<string, unknown> = {
    username,
    password: commons.generatePassword(password, passsalt),
    email,
    passsalt,
    role: "member",
    add_time: nowSeconds(),
    up_time: nowSeconds(),
    type: "site",
  };
  if (!data.username) {
    data.username = email.substr(0, email.indexOf("@"));
  }
  try {
    const user = await userModel.save(data);
    await createPrivateGroup(user._id);
    commons.sendMail(
      {
        to: user.email,
        contents: `<h3>亲爱的用户：</h3><p>您好，感谢使用YApi可视化接口平台,您的账号 ${email} 已经注册成功</p>`,
      },
      () => {}
    );
    return ok({
      user: {
        uid: user._id,
        email: user.email,
        username: user.username,
        add_time: user.add_time,
        up_time: user.up_time,
        role: "member",
        type: user.type,
        study: false,
      },
      cookie: { uid: user._id, passsalt: user.passsalt },
    });
  } catch (e) {
    return fail(401, errorMessage(e));
  }
}
