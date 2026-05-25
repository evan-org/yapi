// @ts-nocheck
/**
 * 项目分组 HTTP 控制器（薄层：权限校验 → Service）
 */
import yapi from "../runtime.js";
import baseController from "./base.js";
import { groupService } from "../services/index.js";

class groupController extends baseController {
  constructor(ctx) {
    super(ctx);

    const id = "number";
    const group_name = { type: "string", minLength: 1 };
    const group_desc = "string";
    const role = { type: "string", enum: ["owner", "dev", "guest"] };
    const member_uids = { type: "array", items: "number", minItems: 1 };

    this.schemaMap = {
      get: { "*id": id },
      add: {
        "*group_name": group_name,
        group_desc: group_desc,
        owner_uids: ["number"],
      },
      addMember: {
        "*id": id,
        role: role,
        "*member_uids": member_uids,
      },
      changeMemberRole: {
        "*member_uid": "number",
        "*id": id,
        role: role,
      },
      getMemberList: { "*id": id },
      delMember: { "*id": id, "*member_uid": "number" },
      del: { "*id": id },
      up: {
        "*id": id,
        "*group_name": group_name,
        group_desc: group_desc,
        custom_field1: { name: "string", enable: "boolen" },
        custom_field2: { name: "string", enable: "boolen" },
        custom_field3: { name: "string", enable: "boolen" },
      },
    };
  }

  _operator() {
    return {
      uid: this.getUid(),
      username: this.getUsername(),
    };
  }

  _reply(ctx, result) {
    if (!result.ok) {
      ctx.body = yapi.commons.resReturn(null, result.code, result.message);
      return;
    }
    ctx.body = yapi.commons.resReturn(result.data);
  }

  async get(ctx) {
    const result = await groupService.getById(ctx.params.id);
    if (!result.ok) {
      return this._reply(ctx, result);
    }
    const role = await this.getProjectRole(ctx.params.id, "group");
    result.data.role = role;
    ctx.body = yapi.commons.resReturn(result.data);
  }

  async add(ctx) {
    this._reply(ctx, await groupService.create(ctx.params, this._operator()));
  }

  async getMyGroup(ctx) {
    const privateGroup = await groupService.getOrCreatePrivateGroup(this.getUid());
    ctx.body = yapi.commons.resReturn(privateGroup || null);
  }

  async addMember(ctx) {
    this._reply(
      ctx,
      await groupService.addMembers(ctx.params, this._operator())
    );
  }

  async changeMemberRole(ctx) {
    if ((await this.checkAuth(ctx.request.body.id, "group", "danger")) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
    }
    this._reply(
      ctx,
      await groupService.changeMemberRole(ctx.request.body, this._operator())
    );
  }

  async getMemberList(ctx) {
    this._reply(ctx, await groupService.getMemberList(ctx.params.id));
  }

  async delMember(ctx) {
    if ((await this.checkAuth(ctx.params.id, "group", "danger")) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
    }
    this._reply(
      ctx,
      await groupService.removeMember(ctx.params, this._operator())
    );
  }

  async list(ctx) {
    this._reply(
      ctx,
      await groupService.listForUser(this.getUid(), this.getRole())
    );
  }

  async del(ctx) {
    if (this.getRole() !== "admin") {
      return (ctx.body = yapi.commons.resReturn(null, 401, "没有权限"));
    }
    this._reply(ctx, await groupService.removeGroup(ctx.params.id));
  }

  async up(ctx) {
    if ((await this.checkAuth(ctx.params.id, "group", "danger")) !== true) {
      return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
    }
    this._reply(ctx, await groupService.updateGroup(ctx.params, this._operator()));
  }
}

export default groupController;
