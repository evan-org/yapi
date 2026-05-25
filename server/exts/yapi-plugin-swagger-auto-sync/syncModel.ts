// @ts-nocheck
/**
 * Swagger 自动同步模型：委托关系型 swaggerSyncRepository
 */
import baseModel from "models/base";
import { swaggerSyncRepository } from "../../repositories/swaggerSync.repo.js";

class syncModel extends baseModel {
  getName() {
    return "interface_auto_sync";
  }

  getByProjectId(id) {
    return swaggerSyncRepository.getByProjectId(id);
  }

  delByProjectId(project_id) {
    return swaggerSyncRepository.delByProjectId(project_id);
  }

  save(data) {
    return swaggerSyncRepository.save(data);
  }

  listAll() {
    return swaggerSyncRepository.listAll();
  }

  up(data) {
    return swaggerSyncRepository.up(data);
  }

  upById(id, data) {
    return swaggerSyncRepository.upById(id, data);
  }

  del(id) {
    return swaggerSyncRepository.del(id);
  }
}

export default syncModel;
