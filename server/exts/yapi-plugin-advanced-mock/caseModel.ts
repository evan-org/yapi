// @ts-nocheck
/**
 * 高级 Mock 期望模型：委托关系型 advMockCaseRepository
 */
import baseModel from "models/base";
import { advMockCaseRepository } from "../../repositories/advMockCase.repo.js";

class caseModel extends baseModel {
  getName() {
    return "adv_mock_case";
  }

  get(data) {
    return advMockCaseRepository.get(data);
  }

  list(id) {
    return advMockCaseRepository.list(id);
  }

  listForMock(interface_id, filter) {
    return advMockCaseRepository.listForMock(interface_id, filter);
  }

  delByInterfaceId(interface_id) {
    return advMockCaseRepository.delByInterfaceId(interface_id);
  }

  delByProjectId(project_id) {
    return advMockCaseRepository.delByProjectId(project_id);
  }

  save(data) {
    return advMockCaseRepository.save(data);
  }

  up(data) {
    return advMockCaseRepository.up(data);
  }

  del(id) {
    return advMockCaseRepository.del(id);
  }
}

export default caseModel;
