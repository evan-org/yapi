// @ts-nocheck
/**
 * 用户头像模型：委托关系型 avatarRepository
 */
import baseModel from "./base.js";
import { avatarRepository } from "../repositories/avatar.repo.js";

class avatarModel extends baseModel {
  getName() {
    return "avatar";
  }

  get(uid: number | string) {
    return avatarRepository.get(uid);
  }

  async up(uid: number | string, basecode: string, type: string) {
    return avatarRepository.up(uid, basecode, type);
  }
}

export default avatarModel;
