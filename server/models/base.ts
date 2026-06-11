// @ts-nocheck
/**
 * 数据模型基类：业务表均委托 repository
 */
class baseModel {
  constructor() {
    this.table = this.getName();
  }

  getName() {
    return "";
  }
}

export default baseModel;
