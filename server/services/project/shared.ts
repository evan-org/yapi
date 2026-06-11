// @ts-nocheck
/**
 * 项目子模块共享：仓储引用
 */
import {
  projectRepository,
  groupRepository,
  interfaceRepository,
  interfaceColRepository,
  interfaceCaseRepository,
  followRepository,
  interfaceCatRepository,
  userRepository,
  tokenRepository,
} from "../../repositories/index.js";

export const repos = {
  projectModel: projectRepository,
  groupModel: groupRepository,
  interfaceModel: interfaceRepository,
  interfaceColModel: interfaceColRepository,
  interfaceCaseModel: interfaceCaseRepository,
  followModel: followRepository,
  catModel: interfaceCatRepository,
  userModel: userRepository,
  tokenModel: tokenRepository,
};

export function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
