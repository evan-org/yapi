/**
 * 数据仓储统一导出（编译后为 CommonJS，供 controllers 使用）
 */
export { createModelRepository } from "./base.repo";
export type { LegacyModelInstance } from "./base.repo";

export {
  interfaceRepository,
  type InterfaceRepository,
} from "./interface.repo";
export {
  interfaceCatRepository,
  type InterfaceCatRepository,
} from "./interfaceCat.repo";
export {
  interfaceCaseRepository,
  type InterfaceCaseRepository,
} from "./interfaceCase.repo";
export {
  interfaceColRepository,
  type InterfaceColRepository,
} from "./interfaceCol.repo";
export { projectRepository, type ProjectRepository } from "./project.repo";
export { userRepository, type UserRepository } from "./user.repo";
export { groupRepository, type GroupRepository } from "./group.repo";
export { followRepository, type FollowRepository } from "./follow.repo";
export { logRepository, type LogRepository } from "./log.repo";
export { tokenRepository, type TokenRepository } from "./token.repo";
export { avatarRepository, type AvatarRepository } from "./avatar.repo";
export { storageRepository, type StorageRepository } from "./storage.repo";
