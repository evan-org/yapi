/**
 * 用户模块业务逻辑
 */
import yapi from "../runtime.js";
import commons from "../utils/commons.js";
import { ldapQuery } from "../utils/ldap.js";
import { clientPublicFile } from "../utils/client-public.js";
import {
  userRepository,
  groupRepository,
  projectRepository,
  interfaceRepository,
  avatarRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";
import {
  validateLoginCredentials,
  validateChangePasswordParams,
  validateRegisterFields,
  parseAvatarBasecode,
  resolveLdapIdentity,
  type LdapLoginConfig,
} from "./user.validation.js";

type UserActor = {
  role: string;
  currentUid: number | string;
};

type NavigationChainResult = {
  interface?: { project_id: number | string };
  project?: { group_id: number | string };
  group?: Record<string, unknown>;
};

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

class UserService extends BaseService {
  userModel = userRepository;
  groupModel = groupRepository;
  projectModel = projectRepository;
  interfaceModel = interfaceRepository;
  avatarModel = avatarRepository;

  /**
   * 登录校验
   */
  async login(credentials: { email?: string; password?: string }) {
    const validated = validateLoginCredentials(credentials);
    if (!validated.ok) {
      return validated;
    }
    const { email, password } = validated.data;
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      return fail(404, "该用户不存在");
    }
    if (commons.generatePassword(password, user.passsalt) !== user.password) {
      return fail(405, "密码错误");
    }
    return ok({
      session: this.toSessionUser(user),
      cookie: { uid: user._id, passsalt: user.passsalt },
    });
  }

  /**
   * 标记用户已完成引导
   */
  async markStudyDone(uid: number | string) {
    try {
      const result = await this.userModel.update(uid, {
        up_time: commons.time(),
        study: true,
      });
      return ok(result);
    } catch (e) {
      return fail(401, errorMessage(e));
    }
  }

  /**
   * LDAP 登录
   */
  async loginByLdap(credentials: { email: string; password: string }) {
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
      const third = await this.ensureThirdPartyUser(emailParams, username);
      if (!third.ok) {
        return third;
      }
      const user = await this.userModel.findByEmail(emailParams);
      return ok({
        session: this.toSessionUser(user, user.type || "third"),
        cookie: { uid: user._id, passsalt: user.passsalt },
      });
    } catch (e) {
      commons.log(errorMessage(e), "error");
      return fail(401, errorMessage(e));
    }
  }

  /**
   * 第三方登录：查找或创建用户
   */
  async ensureThirdPartyUser(email: string, username: string) {
    try {
      let user = await this.userModel.findByEmail(email);
      if (!user || !user._id) {
        const passsalt = commons.randStr();
        const data = {
          username,
          password: commons.generatePassword(passsalt, passsalt),
          email,
          passsalt,
          role: "member",
          add_time: commons.time(),
          up_time: commons.time(),
          type: "third",
        };
        user = await this.userModel.save(data);
        await this.createPrivateGroup(user._id);
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

  /**
   * 修改密码
   */
  async changePassword(
    params: { uid?: number | string; password?: string; old_password?: string },
    actor: UserActor
  ) {
    const validated = validateChangePasswordParams(params);
    if (!validated.ok) {
      return validated;
    }
    const user = await this.userModel.findById(validated.data.uid);
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
      const result = await this.userModel.update(validated.data.uid, {
        up_time: commons.time(),
        password: commons.generatePassword(validated.data.password, passsalt),
        passsalt,
      });
      return ok(result);
    } catch (e) {
      return fail(401, errorMessage(e));
    }
  }

  /**
   * 注册新用户
   */
  async register(params: { username?: string; password?: string; email?: string }) {
    if (yapi.WEBCONFIG.closeRegister) {
      return fail(400, "禁止注册，请联系管理员");
    }
    const validated = validateRegisterFields(params);
    if (!validated.ok) {
      return validated;
    }
    const { email, password, username } = validated.data;
    const checkRepeat = await this.userModel.checkRepeat(email);
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
      add_time: commons.time(),
      up_time: commons.time(),
      type: "site",
    };
    if (!data.username) {
      data.username = email.substr(0, email.indexOf("@"));
    }
    try {
      const user = await this.userModel.save(data);
      await this.createPrivateGroup(user._id);
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

  /**
   * 分页用户列表
   */
  async listPaged(page: number, limit: number) {
    try {
      const list = await this.userModel.listWithPaging(page, limit);
      const count = await this.userModel.listCount();
      return ok({
        count,
        total: Math.ceil(count / limit),
        list,
      });
    } catch (e) {
      return fail(402, errorMessage(e));
    }
  }

  /**
   * 按 id 查询用户
   */
  async findById(id: number | string, actor: UserActor) {
    if (actor.role !== "admin" && id != actor.currentUid) {
      return fail(401, "没有权限");
    }
    if (!id) {
      return fail(400, "uid不能为空");
    }
    try {
      const result = await this.userModel.findById(id);
      if (!result) {
        return fail(402, "不存在的用户");
      }
      return ok({
        uid: result._id,
        username: result.username,
        email: result.email,
        role: result.role,
        type: result.type,
        add_time: result.add_time,
        up_time: result.up_time,
      });
    } catch (e) {
      return fail(402, errorMessage(e));
    }
  }

  /**
   * 删除用户（仅 admin）
   */
  async remove(id: number | string, actor: UserActor) {
    if (actor.role !== "admin") {
      return fail(402, "Without permission.");
    }
    if (id == actor.currentUid) {
      return fail(403, "禁止删除管理员");
    }
    if (!id) {
      return fail(400, "uid不能为空");
    }
    try {
      const result = await this.userModel.del(id);
      return ok(result);
    } catch (e) {
      return fail(402, errorMessage(e));
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(
    params: { uid?: number | string; username?: string; email?: string },
    actor: UserActor
  ) {
    const normalized = commons.handleParams(params, {
      username: "string",
      email: "string",
    }) as { uid?: number | string; username?: string; email?: string };
    if (actor.role !== "admin" && normalized.uid != actor.currentUid) {
      return fail(401, "没有权限");
    }
    const id = normalized.uid;
    if (!id) {
      return fail(400, "uid不能为空");
    }
    try {
      const userData = await this.userModel.findById(id);
      if (!userData) {
        return fail(400, "uid不存在");
      }
      const data: Record<string, unknown> = { up_time: commons.time() };
      if (normalized.username) {
        data.username = normalized.username;
      }
      if (normalized.email) {
        data.email = normalized.email;
      }
      if (data.email) {
        const checkRepeat = await this.userModel.checkRepeat(data.email);
        if (checkRepeat > 0) {
          return fail(401, "该email已经注册");
        }
      }
      const member = {
        uid: id,
        username: (data.username as string) || userData.username,
        email: (data.email as string) || userData.email,
      };
      await this.groupModel.updateMember(member);
      await this.projectModel.updateMember(member);
      const result = await this.userModel.update(id, data);
      return ok(result);
    } catch (e) {
      return fail(402, errorMessage(e));
    }
  }

  /**
   * 上传头像（base64）
   */
  async uploadAvatar(uid: number | string, basecode: string | undefined) {
    const parsed = parseAvatarBasecode(basecode);
    if (!parsed.ok) {
      return parsed;
    }
    try {
      const result = await this.avatarModel.up(
        String(uid),
        parsed.data.payload,
        parsed.data.type
      );
      return ok(result);
    } catch (e) {
      return fail(401, errorMessage(e));
    }
  }

  /**
   * 读取头像二进制
   */
  async getAvatarBuffer(uid: number | string) {
    try {
      const data = await this.avatarModel.get(uid);
      if (!data || !data.basecode) {
        return ok({
          type: "image/png",
          buffer: yapi.fs.readFileSync(clientPublicFile("image", "avatar.png")),
        });
      }
      return ok({
        type: data.type,
        buffer: Buffer.from(data.basecode, "base64"),
      });
    } catch (err) {
      return fail(500, errorMessage(err));
    }
  }

  /**
   * 搜索用户
   */
  async search(keyword: string) {
    if (!keyword) {
      return fail(400, "No keyword.");
    }
    if (!commons.validateSearchKeyword(keyword)) {
      return fail(400, "Bad query.");
    }
    const queryList = await this.userModel.search(keyword);
    const rules = [
      { key: "_id", alias: "uid" },
      "username",
      "email",
      "role",
      { key: "add_time", alias: "addTime" },
      { key: "up_time", alias: "upTime" },
    ];
    const filteredRes = commons.filterRes(queryList, rules);
    return ok(filteredRes);
  }

  /**
   * 按 type/id 加载 interface → project → group 链（不含权限 role）
   */
  async loadNavigationChain(id: number | string, type: string) {
    const result: NavigationChainResult = {};
    let currentType = type;
    let currentId: number | string = id;
    try {
      if (currentType === "interface") {
        result.interface = await this.interfaceModel.get(currentId);
        currentType = "project";
        currentId = result.interface.project_id;
      }
      if (currentType === "project") {
        const projectData = await this.projectModel.get(currentId);
        result.project = projectData;
        currentType = "group";
        currentId = result.project.group_id;
      }
      if (currentType === "group") {
        const groupData = await this.groupModel.get(currentId);
        result.group = groupData;
      }
      return ok(result);
    } catch (e) {
      return fail(422, errorMessage(e));
    }
  }

  /**
   * 创建用户私有分组
   */
  async createPrivateGroup(uid: number | string) {
    await this.groupModel.save({
      uid,
      group_name: "User-" + uid,
      add_time: commons.time(),
      up_time: commons.time(),
      type: "private",
    });
  }

  /**
   * 成员信息（供 group 等模块复用）
   */
  async getMemberProfile(uid: number | string, role = "dev") {
    const userData = await this.userModel.findById(uid);
    if (!userData) {
      return null;
    }
    return {
      _role: userData.role,
      role,
      uid: userData._id,
      username: userData.username,
      email: userData.email,
    };
  }

  /**
   * 登录态用户字段
   */
  toSessionUser(user: Record<string, unknown>, typeOverride?: string) {
    return {
      username: user.username,
      role: user.role,
      uid: user._id,
      email: user.email,
      add_time: user.add_time,
      up_time: user.up_time,
      type: typeOverride || user.type || "site",
      study: user.study,
    };
  }
}

export default new UserService();
