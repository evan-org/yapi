// @ts-nocheck
/**
 * Wiki 模型：委托关系型 wikiRepository
 */
import baseModel from "models/base";
import { wikiRepository } from "../../repositories/wiki.repo.js";

class wikiModel extends baseModel {
  getName() {
    return "wiki";
  }

  save(data) {
    return wikiRepository.save(data);
  }

  get(project_id) {
    return wikiRepository.get(project_id);
  }

  up(id, data) {
    return wikiRepository.up(id, data);
  }

  upEditUid(id, uid) {
    return wikiRepository.upEditUid(id, uid);
  }
}

export default wikiModel;
