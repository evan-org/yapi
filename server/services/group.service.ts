/**
 * 项目分组业务逻辑
 */
import _ from "underscore";
import commons from "../utils/commons.js";
import {
  groupRepository,
  projectRepository,
  interfaceRepository,
  interfaceColRepository,
  interfaceCaseRepository,
} from "../repositories/index.js";
import BaseService from "./base.service.js";
import userService from "./user.service.js";
import { ok, fail } from "./service-result.js";
import {
  GROUP_ROLE_LABEL,
  enrichGroupForDisplay,
  resolveMemberRole,
} from "./group.util.js";

type GroupOperator = {
  uid: number | string;
  username: string;
};

class GroupService extends BaseService {
  groupModel = groupRepository;
  projectModel = projectRepository;
  interfaceModel = interfaceRepository;
  interfaceColModel = interfaceColRepository;
  interfaceCaseModel = interfaceCaseRepository;

  /**
   * 获取分组详情（不含 role，role 由 controller 注入）
   */
  async getById(id: number | string) {
    const result = await this.groupModel.getGroupById(id);
    if (!result) {
      return fail(404, "分组不存在");
    }
    return ok(enrichGroupForDisplay(result));
  }

  /**
   * 新增分组
   */
  async create(
    params: {
      group_name: string;
      group_desc?: string;
      owner_uids?: Array<number | string>;
    },
    operator: GroupOperator
  ) {
    let ownerUids = params.owner_uids || [];
    if (ownerUids.length === 0) {
      ownerUids.push(operator.uid);
    }
    const owners = [];
    for (let i = 0, len = ownerUids.length; i < len; i++) {
      const id = ownerUids[i];
      const groupUserdata = await userService.getMemberProfile(id, "owner");
      if (groupUserdata) {
        owners.push(groupUserdata);
      }
    }
    const checkRepeat = await this.groupModel.checkRepeat(params.group_name);
    if (checkRepeat > 0) {
      return fail(401, "项目分组名已存在");
    }
    const data = {
      group_name: params.group_name,
      group_desc: params.group_desc,
      uid: operator.uid,
      add_time: commons.time(),
      up_time: commons.time(),
      members: owners,
    };
    let result = await this.groupModel.save(data);
    result = commons.fieldSelect(result, [
      "_id",
      "group_name",
      "group_desc",
      "uid",
      "members",
      "type",
    ]);
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 新增了分组 <a href="/group/${result._id}">${params.group_name}</a>`,
      type: "group",
      uid: operator.uid,
      username: operator.username,
      typeid: result._id,
    });
    return ok(result);
  }

  /**
   * 获取或创建当前用户私有空间
   */
  async getOrCreatePrivateGroup(uid: number | string) {
    let privateGroup = await this.groupModel.getByPrivateUid(uid);
    if (!privateGroup) {
      privateGroup = await this.groupModel.save({
        uid,
        group_name: "User-" + uid,
        add_time: commons.time(),
        up_time: commons.time(),
        type: "private",
      });
    }
    return privateGroup;
  }

  /**
   * 添加分组成员
   */
  async addMembers(
    params: {
      id: number | string;
      role?: string;
      member_uids: Array<number | string>;
    },
    operator: GroupOperator
  ) {
    const role = resolveMemberRole(params.role);
    const addMembers = [];
    const existMembers = [];
    const noMembers = [];
    for (let i = 0, len = params.member_uids.length; i < len; i++) {
      const id = params.member_uids[i];
      const check = await this.groupModel.checkMemberRepeat(params.id, id);
      const userdata = await userService.getMemberProfile(id, role);
      if (check > 0) {
        existMembers.push(userdata);
      } else if (!userdata) {
        noMembers.push(id);
      } else {
        userdata.role !== "admin" && addMembers.push(userdata);
        delete userdata._role;
      }
    }
    const result = await this.groupModel.addMember(params.id, addMembers);
    if (addMembers.length) {
      const memberLinks = addMembers
        .map((item) => `<a href = "/user/profile/${item.uid}">${item.username}</a>`)
        .join("、");
      commons.saveLog({
        content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 新增了分组成员 ${memberLinks} 为 ${GROUP_ROLE_LABEL[role]}`,
        type: "group",
        uid: operator.uid,
        username: operator.username,
        typeid: params.id,
      });
    }
    return ok({
      result,
      add_members: addMembers,
      exist_members: existMembers,
      no_members: noMembers,
    });
  }

  /**
   * 修改成员角色（不含权限校验）
   */
  async changeMemberRole(
    params: {
      id: number | string;
      member_uid: number | string;
      role?: string;
    },
    operator: GroupOperator
  ) {
    const check = await this.groupModel.checkMemberRepeat(
      params.id,
      params.member_uid
    );
    if (check === 0) {
      return fail(400, "分组成员不存在");
    }
    const role = resolveMemberRole(params.role);
    const result = await this.groupModel.changeMemberRole(
      params.id,
      params.member_uid,
      role
    );
    const groupUserdata = await userService.getMemberProfile(
      params.member_uid,
      role
    );
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 更改了分组成员 <a href="/user/profile/${params.member_uid}">${groupUserdata ? groupUserdata.username : ""}</a> 的权限为 "${GROUP_ROLE_LABEL[role]}"`,
      type: "group",
      uid: operator.uid,
      username: operator.username,
      typeid: params.id,
    });
    return ok(result);
  }

  /**
   * 分组成员列表
   */
  async getMemberList(groupId: number | string) {
    const group = await this.groupModel.get(groupId);
    return ok(group.members);
  }

  /**
   * 删除分组成员（不含权限校验）
   */
  async removeMember(
    params: {
      id: number | string;
      member_uid: number | string;
      role?: string;
    },
    operator: GroupOperator
  ) {
    const check = await this.groupModel.checkMemberRepeat(
      params.id,
      params.member_uid
    );
    if (check === 0) {
      return fail(400, "分组成员不存在");
    }
    const result = await this.groupModel.delMember(params.id, params.member_uid);
    const groupUserdata = await userService.getMemberProfile(
      params.member_uid,
      params.role
    );
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 删除了分组成员 <a href="/user/profile/${params.member_uid}">${groupUserdata ? groupUserdata.username : ""}</a>`,
      type: "group",
      uid: operator.uid,
      username: operator.username,
      typeid: params.id,
    });
    return ok(result);
  }

  /**
   * 当前用户可见的分组列表
   */
  async listForUser(uid: number | string, role: string) {
    let privateGroup = await this.getOrCreatePrivateGroup(uid);
    const newResult = [];

    if (role === "admin") {
      let result = await this.groupModel.list();
      if (result && result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          result[i] = result[i];
          newResult.unshift(result[i]);
        }
      }
    } else {
      let result = await this.groupModel.getAuthList(uid);
      if (result && result.length > 0) {
        for (let i = 0; i < result.length; i++) {
          result[i] = result[i];
          newResult.unshift(result[i]);
        }
      }
      const groupIds = newResult.map((item) => item._id);
      const newGroupIds = [];
      const groupByProject = await this.projectModel.getAuthList(uid);
      if (groupByProject && groupByProject.length > 0) {
        groupByProject.forEach((_data) => {
          const _temp = [...groupIds, ...newGroupIds];
          if (!_.find(_temp, (id) => id === _data.group_id)) {
            newGroupIds.push(_data.group_id);
          }
        });
      }
      const newData = await this.groupModel.findByGroups(newGroupIds);
      newData.forEach((_data) => {
        _data = _data;
        newResult.push(_data);
      });
    }

    if (privateGroup) {
      privateGroup = privateGroup;
      privateGroup.group_name = "个人空间";
      privateGroup.role = "owner";
      newResult.unshift(privateGroup);
    }
    return ok(newResult);
  }

  /**
   * 删除分组及下属项目数据（仅 admin）
   */
  async removeGroup(groupId: number | string) {
    const projectList = await this.projectModel.list(groupId, true);
    for (const p of projectList) {
      await this.interfaceModel.delByProjectId(p._id);
      await this.interfaceCaseModel.delByProjectId(p._id);
      await this.interfaceColModel.delByProjectId(p._id);
    }
    if (projectList.length > 0) {
      await this.projectModel.delByGroupid(groupId);
    }
    const result = await this.groupModel.del(groupId);
    return ok(result);
  }

  /**
   * 更新分组（不含权限校验）
   */
  async updateGroup(
    params: { id: number | string; group_name: string; [key: string]: unknown },
    operator: GroupOperator
  ) {
    const result = await this.groupModel.up(params.id, params);
    commons.saveLog({
      content: `<a href="/user/profile/${operator.uid}">${operator.username}</a> 更新了 <a href="/group/${params.id}">${params.group_name}</a> 分组`,
      type: "group",
      uid: operator.uid,
      username: operator.username,
      typeid: params.id,
    });
    return ok(result);
  }
}

export default new GroupService();
