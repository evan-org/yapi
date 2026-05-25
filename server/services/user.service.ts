// @ts-nocheck
/**
 * 用户模块业务逻辑
 */
import yapi from "../runtime.js";
import userModel from "../models/user.js";
import groupModel from "../models/group.js";
import projectModel from "../models/project.js";
import interfaceModel from "../models/interface.js";
import avatarModel from "../models/avatar.js";
import ldap from "../utils/ldap.js";
import { clientPublicFile } from "../utils/client-public.js";
import BaseService from "./base.service.js";
import { ok, fail } from "./service-result.js";

class UserService extends BaseService {
  constructor() {
    super();
    this.userModel = this.getModel(userModel);
    this.groupModel = this.getModel(groupModel);
    this.projectModel = this.getModel(projectModel);
    this.interfaceModel = this.getModel(interfaceModel);
    this.avatarModel = this.getModel(avatarModel);
  }

  /**
   * 登录校验
   * @param {{ email: string, password: string }} credentials
   */
  async login(credentials) {
    const email = (credentials.email || "").trim();
    const password = credentials.password;
    if (!email) {
      return fail(400, "email不能为空");
    }
    if (!password) {
      return fail(400, "密码不能为空");
    }
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      return fail(404, "该用户不存在");
    }
    if (yapi.commons.generatePassword(password, user.passsalt) !== user.password) {
      return fail(405, "密码错误");
    }
    return ok({
      session: this.toSessionUser(user),
      cookie: { uid: user._id, passsalt: user.passsalt },
    });
  }

  /**
   * 标记用户已完成引导
   * @param {number|string} uid
   */
  async markStudyDone(uid) {
    try {
      const result = await this.userModel.update(uid, {
        up_time: yapi.commons.time(),
        study: true,
      });
      return ok(result);
    } catch (e) {
      return fail(401, e.message);
    }
  }

  /**
   * LDAP 登录
   * @param {{ email: string, password: string }} credentials
   */
  async loginByLdap(credentials) {
    try {
      const { email, password } = credentials;
      const { info: ldapInfo } = await ldap.ldapQuery(email, password);
      const emailPrefix = email.split(/@/g)[0];
      const emailPostfix = yapi.WEBCONFIG.ldapLogin.emailPostfix;
      const emailParams =
        ldapInfo[yapi.WEBCONFIG.ldapLogin.emailKey || "mail"] ||
        (emailPostfix ? emailPrefix + emailPostfix : email);
      const username =
        ldapInfo[yapi.WEBCONFIG.ldapLogin.usernameKey] || emailPrefix;
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
      yapi.commons.log(e.message, "error");
      return fail(401, e.message);
    }
  }

  /**
   * 第三方登录：查找或创建用户
   * @param {string} email
   * @param {string} username
   */
  async ensureThirdPartyUser(email, username) {
    try {
      let user = await this.userModel.findByEmail(email);
      if (!user || !user._id) {
        const passsalt = yapi.commons.randStr();
        const data = {
          username,
          password: yapi.commons.generatePassword(passsalt, passsalt),
          email,
          passsalt,
          role: "member",
          add_time: yapi.commons.time(),
          up_time: yapi.commons.time(),
          type: "third",
        };
        user = await this.userModel.save(data);
        await this.createPrivateGroup(user._id);
        yapi.commons.sendMail({
          to: email,
          contents: `<h3>亲爱的用户：</h3><p>您好，感谢使用YApi平台，你的邮箱账号是：${email}</p>`,
        });
      }
      return ok({ uid: user._id, passsalt: user.passsalt, user });
    } catch (e) {
      console.error("third_login:", e.message); // eslint-disable-line
      return fail(401, `third_login: ${e.message}`);
    }
  }

  /**
   * 修改密码
   * @param {{ uid: number, password: string, old_password?: string }} params
   * @param {{ role: string, currentUid: number|string }} actor
   */
  async changePassword(params, actor) {
    if (!params.uid) {
      return fail(400, "uid不能为空");
    }
    if (!params.password) {
      return fail(400, "密码不能为空");
    }
    const user = await this.userModel.findById(params.uid);
    if (actor.role !== "admin" && params.uid != actor.currentUid) {
      return fail(402, "没有权限");
    }
    if (actor.role !== "admin" || user.role === "admin") {
      if (!params.old_password) {
        return fail(400, "旧密码不能为空");
      }
      if (
        yapi.commons.generatePassword(params.old_password, user.passsalt) !==
        user.password
      ) {
        return fail(402, "旧密码错误");
      }
    }
    const passsalt = yapi.commons.randStr();
    try {
      const result = await this.userModel.update(params.uid, {
        up_time: yapi.commons.time(),
        password: yapi.commons.generatePassword(params.password, passsalt),
        passsalt,
      });
      return ok(result);
    } catch (e) {
      return fail(401, e.message);
    }
  }

  /**
   * 注册新用户
   * @param {{ username?: string, password: string, email: string }} params
   */
  async register(params) {
    if (yapi.WEBCONFIG.closeRegister) {
      return fail(400, "禁止注册，请联系管理员");
    }
    const normalized = yapi.commons.handleParams(params, {
      username: "string",
      password: "string",
      email: "string",
    });
    if (!normalized.email) {
      return fail(400, "邮箱不能为空");
    }
    if (!normalized.password) {
      return fail(400, "密码不能为空");
    }
    const checkRepeat = await this.userModel.checkRepeat(normalized.email);
    if (checkRepeat > 0) {
      return fail(401, "该email已经注册");
    }
    const passsalt = yapi.commons.randStr();
    const data = {
      username: normalized.username,
      password: yapi.commons.generatePassword(normalized.password, passsalt),
      email: normalized.email,
      passsalt,
      role: "member",
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
      type: "site",
    };
    if (!data.username) {
      data.username = data.email.substr(0, data.email.indexOf("@"));
    }
    try {
      const user = await this.userModel.save(data);
      await this.createPrivateGroup(user._id);
      yapi.commons.sendMail({
        to: user.email,
        contents: `<h3>亲爱的用户：</h3><p>您好，感谢使用YApi可视化接口平台,您的账号 ${normalized.email} 已经注册成功</p>`,
      });
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
      return fail(401, e.message);
    }
  }

  /**
   * 分页用户列表
   */
  async listPaged(page, limit) {
    try {
      const list = await this.userModel.listWithPaging(page, limit);
      const count = await this.userModel.listCount();
      return ok({
        count,
        total: Math.ceil(count / limit),
        list,
      });
    } catch (e) {
      return fail(402, e.message);
    }
  }

  /**
   * 按 id 查询用户
   * @param {number|string} id
   * @param {{ role: string, currentUid: number|string }} actor
   */
  async findById(id, actor) {
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
      return fail(402, e.message);
    }
  }

  /**
   * 删除用户（仅 admin）
   */
  async remove(id, actor) {
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
      return fail(402, e.message);
    }
  }

  /**
   * 更新用户资料
   */
  async updateProfile(params, actor) {
    const normalized = yapi.commons.handleParams(params, {
      username: "string",
      email: "string",
    });
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
      const data = { up_time: yapi.commons.time() };
      normalized.username && (data.username = normalized.username);
      normalized.email && (data.email = normalized.email);
      if (data.email) {
        const checkRepeat = await this.userModel.checkRepeat(data.email);
        if (checkRepeat > 0) {
          return fail(401, "该email已经注册");
        }
      }
      const member = {
        uid: id,
        username: data.username || userData.username,
        email: data.email || userData.email,
      };
      await this.groupModel.updateMember(member);
      await this.projectModel.updateMember(member);
      const result = await this.userModel.update(id, data);
      return ok(result);
    } catch (e) {
      return fail(402, e.message);
    }
  }

  /**
   * 上传头像（base64）
   */
  async uploadAvatar(uid, basecode) {
    if (!basecode) {
      return fail(400, "basecode不能为空");
    }
    const pngPrefix = "data:image/png;base64,";
    const jpegPrefix = "data:image/jpeg;base64,";
    let type;
    if (basecode.substr(0, pngPrefix.length) === pngPrefix) {
      basecode = basecode.substr(pngPrefix.length);
      type = "image/png";
    } else if (basecode.substr(0, jpegPrefix.length) === jpegPrefix) {
      basecode = basecode.substr(jpegPrefix.length);
      type = "image/jpeg";
    } else {
      return fail(400, "仅支持jpeg和png格式的图片");
    }
    const strLength = basecode.length;
    if (parseInt(strLength - (strLength / 8) * 2) > 200000) {
      return fail(400, "图片大小不能超过200kb");
    }
    try {
      const result = await this.avatarModel.up(uid, basecode, type);
      return ok(result);
    } catch (e) {
      return fail(401, e.message);
    }
  }

  /**
   * 读取头像二进制
   * @param {number|string} uid
   */
  async getAvatarBuffer(uid) {
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
      return fail(500, err.message);
    }
  }

  /**
   * 搜索用户
   */
  async search(keyword) {
    if (!keyword) {
      return fail(400, "No keyword.");
    }
    if (!yapi.commons.validateSearchKeyword(keyword)) {
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
    const filteredRes = yapi.commons.filterRes(queryList, rules);
    return ok(filteredRes);
  }

  /**
   * 按 type/id 加载 interface → project → group 链（不含权限 role）
   */
  async loadNavigationChain(id, type) {
    const result = {};
    let currentType = type;
    let currentId = id;
    try {
      if (currentType === "interface") {
        result.interface = await this.interfaceModel.get(currentId);
        currentType = "project";
        currentId = result.interface.project_id;
      }
      if (currentType === "project") {
        const projectData = await this.projectModel.get(currentId);
        result.project = projectData.toObject();
        currentType = "group";
        currentId = result.project.group_id;
      }
      if (currentType === "group") {
        const groupData = await this.groupModel.get(currentId);
        result.group = groupData.toObject();
      }
      return ok(result);
    } catch (e) {
      return fail(422, e.message);
    }
  }

  /**
   * 创建用户私有分组
   * @param {number|string} uid
   */
  async createPrivateGroup(uid) {
    await this.groupModel.save({
      uid,
      group_name: "User-" + uid,
      add_time: yapi.commons.time(),
      up_time: yapi.commons.time(),
      type: "private",
    });
  }

  /**
   * 成员信息（供 group 等模块复用）
   * @param {number|string} uid
   * @param {string} [role]
   */
  async getMemberProfile(uid, role = "dev") {
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
  toSessionUser(user, typeOverride) {
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
