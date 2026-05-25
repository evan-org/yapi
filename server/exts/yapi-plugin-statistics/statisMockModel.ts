// @ts-nocheck
/**
 * Mock 统计模型：委托关系型 statisMockRepository
 */
import baseModel from "models/base";
import { statisMockRepository } from "../../repositories/statisMock.repo.js";

class statisMockModel extends baseModel {
  getName() {
    return "statis_mock";
  }

  countByGroupId(id) {
    return statisMockRepository.countByGroupId(id);
  }

  save(data) {
    return statisMockRepository.save(data);
  }

  getTotalCount() {
    return statisMockRepository.getTotalCount();
  }

  getDayCount(timeInterval) {
    return statisMockRepository.getDayCount(timeInterval);
  }

  list() {
    return statisMockRepository.list();
  }

  up(id, data) {
    return statisMockRepository.up(id, data);
  }
}

export default statisMockModel;
