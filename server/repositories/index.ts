/**
 * 数据仓储统一导出（ESM，供 controllers / utils 引用）
 */
export { createModelRepository } from "./base.repo.js";
export type { ModelInstance } from "./base.repo.js";

export {
  interfaceRepository,
  type InterfaceRepository,
} from "./interface.repo.js";
export {
  interfaceCatRepository,
  type InterfaceCatRepository,
} from "./interfaceCat.repo.js";
export {
  interfaceCaseRepository,
  type InterfaceCaseRepository,
} from "./interfaceCase.repo.js";
export {
  interfaceColRepository,
  type InterfaceColRepository,
} from "./interfaceCol.repo.js";
export { projectRepository, type ProjectRepository } from "./project.repo.js";
export { userRepository, type UserRepository } from "./user.repo.js";
export { groupRepository, type GroupRepository } from "./group.repo.js";
export { followRepository, type FollowRepository } from "./follow.repo.js";
export { logRepository, type LogRepository } from "./log.repo.js";
export { tokenRepository, type TokenRepository } from "./token.repo.js";
export { avatarRepository, type AvatarRepository } from "./avatar.repo.js";
export { storageRepository, type StorageRepository } from "./storage.repo.js";
export { wikiRepository, type WikiRepository } from "./wiki.repo.js";
export { advMockRepository, type AdvMockRepository } from "./advMock.repo.js";
export {
  advMockCaseRepository,
  type AdvMockCaseRepository,
} from "./advMockCase.repo.js";
