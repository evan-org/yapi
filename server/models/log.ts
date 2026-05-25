// @ts-nocheck
/**
 * 操作日志模型：委托关系型 logRepository
 */
import baseModel from "./base.js";
import { logRepository } from "../repositories/log.repo.js";

class logModel extends baseModel {
  getName() {
    return "log";
  }

  save(data) {
    return logRepository.save(data);
  }

  del(id) {
    return logRepository.del(id);
  }

  list(typeid, type) {
    return logRepository.list(typeid, type);
  }

  listWithPaging(typeid, type, page, limit, selectValue) {
    return logRepository.listWithPaging(typeid, type, page, limit, selectValue);
  }

  listWithPagingByGroup(typeid, pidList, page, limit) {
    return logRepository.listWithPagingByGroup(typeid, pidList, page, limit);
  }

  listCountByGroup(typeid, pidList) {
    return logRepository.listCountByGroup(typeid, pidList);
  }

  listCount(typeid, type, selectValue) {
    return logRepository.listCount(typeid, type, selectValue);
  }

  listWithCatid(typeid, type, interfaceId) {
    return logRepository.listWithCatid(typeid, type, interfaceId);
  }
}

export default logModel;
