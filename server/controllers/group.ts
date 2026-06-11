/**
 * 项目分组 HTTP 控制器（薄层：权限校验 → Service）
 */
import type { AppContext } from "../types/app-context.js";
import commons from "../utils/commons.js";
import baseController from "./base.js";
import { groupService } from "../services/index.js";
import type { ServiceResult } from "../services/service-result.js";
import { replyServiceResult } from "./controller.util.js";

class groupController extends baseController {
  declare schemaMap: Record<string, unknown>;

  constructor(ctx: AppContext) {
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

  _reply(ctx: AppContext, result: ServiceResult<unknown>) {
    replyServiceResult(ctx, result);
  }

  async get(ctx: AppContext) {
    const params = ctx.params as unknown as { id: number | string };
    const result = await groupService.getById(params.id);
    if (result.ok === false) {
      return this._reply(ctx, result);
    }
    const role = await this.getProjectRole(params.id, "group");
    const data = result.data as Record<string, unknown>;
    data.role = role;
    ctx.body = commons.resReturn(data, 0, undefined);
  }

  async add(ctx: AppContext) {
    const params = ctx.params as unknown as {
      group_name: string;
      group_desc?: string;
      owner_uids?: Array<number | string>;
    };
    this._reply(ctx, await groupService.create(params, this._operator()));
  }

  async getMyGroup(ctx: AppContext) {
    const privateGroup = await groupService.getOrCreatePrivateGroup(this.getUid());
    ctx.body = commons.resReturn(privateGroup || null, 0, undefined);
  }

  async addMember(ctx: AppContext) {
    const params = ctx.params as unknown as {
      id: number | string;
      role?: string;
      member_uids: Array<number | string>;
    };
    this._reply(ctx, await groupService.addMembers(params, this._operator()));
  }

  async changeMemberRole(ctx: AppContext) {
    const body = ctx.request.body as { id?: number | string };
    if ((await this.checkAuth(body.id, "group", "danger")) !== true) {
      ctx.body = commons.resReturn(null, 405, "没有权限");
      return;
    }
    const params = ctx.request.body as unknown as {
      id: number | string;
      member_uid: number | string;
      role?: string;
    };
    this._reply(ctx, await groupService.changeMemberRole(params, this._operator()));
  }

  async getMemberList(ctx: AppContext) {
    const params = ctx.params as unknown as { id: number | string };
    this._reply(ctx, await groupService.getMemberList(params.id));
  }

  async delMember(ctx: AppContext) {
    const params = ctx.params as unknown as { id: number | string };
    if ((await this.checkAuth(params.id, "group", "danger")) !== true) {
      ctx.body = commons.resReturn(null, 405, "没有权限");
      return;
    }
    this._reply(
      ctx,
      await groupService.removeMember(
        params as unknown as {
          id: number | string;
          member_uid: number | string;
          role?: string;
        },
        this._operator()
      )
    );
  }

  async list(ctx: AppContext) {
    this._reply(ctx, await groupService.listForUser(this.getUid(), this.getRole()));
  }

  async del(ctx: AppContext) {
    if (this.getRole() !== "admin") {
      ctx.body = commons.resReturn(null, 401, "没有权限");
      return;
    }
    const params = ctx.params as unknown as { id: number | string };
    this._reply(ctx, await groupService.removeGroup(params.id));
  }

  async up(ctx: AppContext) {
    const params = ctx.params as unknown as { id: number | string };
    if ((await this.checkAuth(params.id, "group", "danger")) !== true) {
      ctx.body = commons.resReturn(null, 405, "没有权限");
      return;
    }
    this._reply(
      ctx,
      await groupService.updateGroup(
        params as unknown as {
          id: number | string;
          group_name: string;
          [key: string]: unknown;
        },
        this._operator()
      )
    );
  }
}

export default groupController;
