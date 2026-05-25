// @ts-nocheck
/**
 * 项目 Token 模型：委托关系型 tokenRepository
 */
import baseModel from "./base.js";
import { tokenRepository } from "../repositories/token.repo.js";

class tokenModel extends baseModel {
  getName() {
    return "token";
  }

  save(data) {
    return tokenRepository.save(data);
  }

  get(project_id) {
    return tokenRepository.get(project_id);
  }

  findId(token) {
    return tokenRepository.findId(token);
  }

  up(project_id, token) {
    return tokenRepository.up(project_id, token);
  }
}

export default tokenModel;
