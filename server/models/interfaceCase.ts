// @ts-nocheck
/**
 * 测试用例模型：委托关系型 interfaceCaseRepository
 */
import baseModel from "./base.js";
import { interfaceCaseRepository } from "../repositories/interfaceCase.repo.js";

class interfaceCase extends baseModel {
  getName() {
    return "interface_case";
  }

  save(data) {
    return interfaceCaseRepository.save(data);
  }

  getInterfaceCaseListCount() {
    return interfaceCaseRepository.getInterfaceCaseListCount();
  }

  get(id) {
    return interfaceCaseRepository.get(id);
  }

  list(col_id, select) {
    return interfaceCaseRepository.list(col_id, select);
  }

  del(id) {
    return interfaceCaseRepository.del(id);
  }

  delByProjectId(id) {
    return interfaceCaseRepository.delByProjectId(id);
  }

  delByInterfaceId(id) {
    return interfaceCaseRepository.delByInterfaceId(id);
  }

  delByCol(id) {
    return interfaceCaseRepository.delByCol(id);
  }

  up(id, data) {
    return interfaceCaseRepository.up(id, data);
  }

  upCaseIndex(id, index) {
    return interfaceCaseRepository.upCaseIndex(id, index);
  }
}

export default interfaceCase;
