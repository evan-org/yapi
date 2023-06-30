/**
 * Created by gxl.gao on 2017/10/24.
 */
const yapi = require("@server/yapi.js");
//
const baseController = require("@server/controllers/BaseController.js");
//
const GroupModel = require("@server/models/GroupModel.js");
const ProjectModel = require("@server/models/ProjectModel.js");
const InterfaceModel = require("@server/models/InterfaceModel.js");
const InterfaceCaseModel = require("@server/models/InterfaceCaseModel.js");
//
const statisMockModel = require("@server/models/StatisticsMockModel.js");
//
const commons = require("@common/statisticsUtils.js");
//
const os = require("os");
let cpu = require("cpu-load");
class StatisticsMockController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.Model = yapi.getInst(statisMockModel);
    this.GroupModel = yapi.getInst(GroupModel);
    this.ProjectModel = yapi.getInst(ProjectModel);
    this.InterfaceModel = yapi.getInst(InterfaceModel);
    this.InterfaceCaseModel = yapi.getInst(InterfaceCaseModel);
  }
  /**
   * 获取所有统计总数
   * @interface statismock/count
   * @method get
   * @category statistics
   * @foldnumber 10
   * @returns {Object}
   */
  async getStatisCount(ctx) {
    try {
      let groupCount = await this.GroupModel.getGroupListCount();
      let projectCount = await this.ProjectModel.getProjectListCount();
      let interfaceCount = await this.InterfaceModel.getInterfaceListCount();
      let interfaceCaseCount = await this.InterfaceCaseModel.getInterfaceCaseListCount();
      return (ctx.body = yapi.commons.resReturn({
        groupCount,
        projectCount,
        interfaceCount,
        interfaceCaseCount
      }));
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
  /**
   * 获取所有mock接口数据信息
   * @interface statismock/get
   * @method get
   * @category statistics
   * @foldnumber 10
   * @returns {Object}
   */
  async getMockDateList(ctx) {
    try {
      let mockCount = await this.Model.getTotalCount();
      let mockDateList = [];
      if (!(this.getRole() === "admin")) {
        return (ctx.body = yapi.commons.resReturn(null, 405, "没有权限"));
      }
      //  默认时间是30 天为一周期
      let dateInterval = commons.getDateRange();
      mockDateList = await this.Model.getDayCount(dateInterval);
      return (ctx.body = yapi.commons.resReturn({ mockCount, mockDateList }));
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
  /**
   * 获取邮箱状态信息
   * @interface statismock/getSystemStatus
   * @method get
   * @category statistics
   * @foldnumber 10
   * @returns {Object}
   */
  async getSystemStatus(ctx) {
    try {
      let mail = "";
      if (yapi.WEBROOT_CONFIG.mail && yapi.WEBROOT_CONFIG.mail.enable) {
        mail = await this.checkEmail();
        // return ctx.body = yapi.commons.resReturn(result);
      } else {
        mail = "未配置";
      }
      let load = (await this.cupLoad()) * 100;
      let systemName = os.platform();
      let totalmem = commons.transformBytesToGB(os.totalmem());
      let freemem = commons.transformBytesToGB(os.freemem());
      let uptime = commons.transformSecondsToDay(os.uptime());
      let data = {
        mail,
        systemName,
        totalmem,
        freemem,
        uptime,
        load: load.toFixed(2)
      };
      return (ctx.body = yapi.commons.resReturn(data));
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
  checkEmail() {
    return new Promise((resolve, reject) => {
      let result = {};
      yapi.mail.verify((error) => {
        if (error) {
          result = "不可用";
          resolve(result);
        } else {
          result = "可用";
          resolve(result);
        }
      });
    });
  }
  async groupDataStats(ctx) {
    try {
      let groupData = await this.GroupModel.list();
      let result = [];
      for (let i = 0; i < groupData.length; i++) {
        let group = groupData[i];
        let groupId = group._id;
        const data = {
          name: group.group_name,
          interface: 0,
          mock: 0,
          project: 0
        };
        result.push(data);
        let projectCount = await this.ProjectModel.listCount(groupId);
        let projectData = await this.ProjectModel.list(groupId);
        let interfaceCount = 0;
        for (let j = 0; j < projectData.length; j++) {
          let project = projectData[j];
          interfaceCount += await this.InterfaceModel.listCount({
            project_id: project._id
          });
        }
        let mockCount = await this.Model.countByGroupId(groupId);
        data.interface = interfaceCount;
        data.project = projectCount;
        data.mock = mockCount;
      }
      return (ctx.body = yapi.commons.resReturn(result));
    } catch (err) {
      ctx.body = yapi.commons.resReturn(null, 400, err.message);
    }
  }
  cupLoad() {
    return new Promise((resolve, reject) => {
      cpu(1000, function(load) {
        resolve(load);
      });
    });
  }
}
module.exports = StatisticsMockController;
