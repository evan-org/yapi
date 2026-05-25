// @ts-nocheck
/**
 * 高级 Mock 脚本模型：委托关系型 advMockRepository
 */
import baseModel from "models/base";
import { advMockRepository } from "../../repositories/advMock.repo.js";

class advMockModel extends baseModel {
  getName() {
    return "adv_mock";
  }

  get(interface_id) {
    return advMockRepository.get(interface_id);
  }

  delByInterfaceId(interface_id) {
    return advMockRepository.delByInterfaceId(interface_id);
  }

  delByProjectId(project_id) {
    return advMockRepository.delByProjectId(project_id);
  }

  save(data) {
    return advMockRepository.save(data);
  }

  up(data) {
    return advMockRepository.up(data);
  }
}

export default advMockModel;
