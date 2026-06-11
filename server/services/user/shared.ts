// @ts-nocheck
/**
 * 用户子模块共享：仓储、类型与工具
 */
import {
  userRepository,
  groupRepository,
  projectRepository,
  interfaceRepository,
  avatarRepository,
} from "../../repositories/index.js";

export const repos = {
  userModel: userRepository,
  groupModel: groupRepository,
  projectModel: projectRepository,
  interfaceModel: interfaceRepository,
  avatarModel: avatarRepository,
};

export type UserActor = {
  role: string;
  currentUid: number | string;
};

export type NavigationChainResult = {
  interface?: { project_id: number | string };
  project?: { group_id: number | string };
  group?: Record<string, unknown>;
};

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export function toSessionUser(user: Record<string, unknown>, typeOverride?: string) {
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
