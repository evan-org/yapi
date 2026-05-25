// @ts-nocheck
/**
 * 接口分类模型：委托关系型 interfaceCatRepository
 */
import baseModel from "./base.js";
import { interfaceCatRepository } from "../repositories/interfaceCat.repo.js";

class interfaceCat extends baseModel {
  getName() {
    return "interface_cat";
  }

  save(data) {
    return interfaceCatRepository.save(data);
  }

  get(id) {
    return interfaceCatRepository.get(id);
  }

  checkRepeat(name) {
    return interfaceCatRepository.checkRepeat(name);
  }

  list(project_id) {
    return interfaceCatRepository.list(project_id);
  }

  del(id) {
    return interfaceCatRepository.del(id);
  }

  delByProjectId(id) {
    return interfaceCatRepository.delByProjectId(id);
  }

  up(id, data) {
    return interfaceCatRepository.up(id, data);
  }

  upCatIndex(id, index) {
    return interfaceCatRepository.upCatIndex(id, index);
  }
}

export default interfaceCat;
