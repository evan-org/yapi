// @ts-nocheck
/**
 * 测试集合模型：委托关系型 interfaceColRepository
 */
import baseModel from "./base.js";
import { interfaceColRepository } from "../repositories/interfaceCol.repo.js";

class interfaceCol extends baseModel {
  getName() {
    return "interface_col";
  }

  save(data) {
    return interfaceColRepository.save(data);
  }

  get(id) {
    return interfaceColRepository.get(id);
  }

  checkRepeat(name) {
    return interfaceColRepository.checkRepeat(name);
  }

  list(project_id) {
    return interfaceColRepository.list(project_id);
  }

  del(id) {
    return interfaceColRepository.del(id);
  }

  delByProjectId(id) {
    return interfaceColRepository.delByProjectId(id);
  }

  up(id, data) {
    return interfaceColRepository.up(id, data);
  }

  upColIndex(id, index) {
    return interfaceColRepository.upColIndex(id, index);
  }
}

export default interfaceCol;
