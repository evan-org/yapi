// @ts-nocheck
/**
 * 用户模型：委托 userRepository
 */
import baseModel from "./base.js";
import { userRepository } from "../repositories/user.repo.js";

class userModel extends baseModel {
  getName() {
    return "user";
  }

  save(data) {
    return userRepository.save(data);
  }

  checkRepeat(email) {
    return userRepository.checkRepeat(email);
  }

  list() {
    return userRepository.list();
  }

  findByUids(uids) {
    return userRepository.findByUids(uids);
  }

  listWithPaging(page, limit) {
    return userRepository.listWithPaging(page, limit);
  }

  listCount() {
    return userRepository.listCount();
  }

  findByEmail(email) {
    return userRepository.findByEmail(email);
  }

  findById(id) {
    return userRepository.findById(id);
  }

  del(id) {
    return userRepository.del(id);
  }

  update(id, data) {
    return userRepository.update(id, data);
  }

  search(keyword) {
    return userRepository.search(keyword);
  }
}

export default userModel;
