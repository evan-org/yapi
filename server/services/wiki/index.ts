// @ts-nocheck
/**
 * Wiki 业务门面
 */
import BaseService from "../base.service.js";
import { repos } from "./shared.js";
import * as query from "./query.js";
import * as mutation from "./mutation.js";
import * as lock from "./lock.js";

class WikiService extends BaseService {
  wikiModel = repos.wikiModel;
  projectModel = repos.projectModel;
  userModel = repos.userModel;

  getByProjectId = query.getByProjectId;
  save = mutation.save;
  onWsStart = lock.onWsStart;
  onWsEnd = lock.onWsEnd;
  onWsEditor = lock.onWsEditor;
}

export default new WikiService();
