const yapi = require("@server/yapi.js");
//
const baseController = require("@server/controllers/BaseController.js");
//
const ProjectModel = require("@server/models/ProjectModel.js");
const InterfaceColModel = require("@server/models/InterfaceColModel.js");
const InterfaceCaseModel = require("@server/models/InterfaceCaseModel.js");
const InterfaceModel = require("@server/models/InterfaceModel.js");
const InterfaceCatModel = require("@server/models/InterfaceCatModel.js");
const FollowModel = require("@server/models/FollowModel.js");
const UserModel = require("@server/models/UserModel.js");
//
const { handleParams, crossRequest, handleCurrDomain, checkNameIsExistInArray } = require("@common/postmanLib.js");
const { handleParamsValue, ArrayToObject } = require("@common/utils.js");
const renderToHtml = require("../views/reportHtml/index.js");
const HanldeImportData = require("@common/HandleImportData.js");
const _ = require("underscore");
const createContex = require("@common/createContext.js")
/**
 * {
 *    postman: require('./m')
 * }
 */
const importDataModule = {};
yapi.emitHook("import_data", importDataModule);
class OpenController extends baseController {
  constructor(ctx) {
    super(ctx);
    this.ProjectModel = yapi.getInst(ProjectModel);
    this.InterfaceColModel = yapi.getInst(InterfaceColModel);
    this.InterfaceCaseModel = yapi.getInst(InterfaceCaseModel);
    this.InterfaceModel = yapi.getInst(InterfaceModel);
    this.InterfaceCatModel = yapi.getInst(InterfaceCatModel);
    this.FollowModel = yapi.getInst(FollowModel);
    this.UserModel = yapi.getInst(UserModel);
    this.handleValue = this.handleValue.bind(this);
    this.schemaMap = {
      runAutoTest: {
        "*id": "number",
        project_id: "string",
        token: "string",
        mode: {
          type: "string",
          default: "html"
        },
        email: {
          type: "boolean",
          default: false
        },
        download: {
          type: "boolean",
          default: false
        },
        closeRemoveAdditional: true
      },
      importData: {
        "*type": "string",
        url: "string",
        "*token": "string",
        json: "string",
        project_id: "string",
        merge: {
          type: "string",
          default: "normal"
        }
      }
    };
  }
  async importData(ctx) {
    let type = ctx.params.type;
    let content = ctx.params.json;
    let project_id = ctx.params.project_id;
    let dataSync = ctx.params.merge;
    let warnMessage = ""
    /**
     * 因为以前接口文档写错了，做下兼容
     */
    try {
      if (!dataSync && ctx.params.dataSync) {
        warnMessage = "importData Api 已废弃 dataSync 传参，请联系管理员将 dataSync 改为 merge."
        dataSync = ctx.params.dataSync
      }
    } catch (e) {
      console.error(e);
    }
    let token = ctx.params.token;
    if (!type || !importDataModule[type]) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "不存在的导入方式"));
    }
    if (!content && !ctx.params.url) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "json 或者 url 参数，不能都为空"));
    }
    try {
      let request = require("request");// let Promise = require('Promise');
      let syncGet = function(url) {
        return new Promise(function(resolve, reject) {
          request.get({ url: url }, function(error, response, body) {
            if (error) {
              reject(error);
            } else {
              resolve(body);
            }
          });
        });
      }
      if (ctx.params.url) {
        content = await syncGet(ctx.params.url);
      } else if (content.indexOf("http://") === 0 || content.indexOf("https://") === 0) {
        content = await syncGet(content);
      }
      content = JSON.parse(content);
    } catch (e) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "json 格式有误:" + e));
    }
    let menuList = await this.InterfaceCatModel.list(project_id);
    /**
     * 防止分类被都被删除时取不到 selectCatid
     * 如果没有分类,增加一个默认分类
     */
    if (menuList.length === 0) {
      const catInst = yapi.getInst(InterfaceCatModel);
      const menu = await catInst.save({
        name: "默认分类",
        project_id: project_id,
        desc: "默认分类",
        uid: this.getUid(),
        add_time: yapi.commons.time(),
        up_time: yapi.commons.time()
      });
      menuList.push(menu);
    }
    let selectCatid = menuList[0]._id;
    let projectData = await this.ProjectModel.get(project_id);
    let res = await importDataModule[type](content);
    let successMessage;
    let errorMessage = [];
    await HanldeImportData(
      res,
      project_id,
      selectCatid,
      menuList,
      projectData.basePath,
      dataSync,
      (err) => {
        errorMessage.push(err);
      },
      (msg) => {
        successMessage = msg;
      },
      () => {
      },
      token,
      yapi.WEBROOT_CONFIG.port
    );
    if (errorMessage.length > 0) {
      return (ctx.body = yapi.commons.resReturn(null, 404, errorMessage.join("\n")));
    }
    ctx.body = yapi.commons.resReturn(null, 0, successMessage + warnMessage);
  }
  async projectInterfaceData(ctx) {
    ctx.body = "projectInterfaceData";
  }
  handleValue(val, global) {
    let globalValue = ArrayToObject(global);
    let context = Object.assign({}, { global: globalValue }, this.records);
    return handleParamsValue(val, context);
  }
  handleEvnParams(params) {
    let result = [];
    Object.keys(params).map((item) => {
      if (/env_/gi.test(item)) {
        let curEnv = yapi.commons.trim(params[item]);
        let value = { curEnv, project_id: item.split("_")[1] };
        result.push(value);
      }
    });
    return result;
  }
  async runAutoTest(ctx) {
    if (!this.$tokenAuth) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "token 验证失败"));
    }
    // console.log(1231312)
    const token = ctx.query.token;
    const projectId = ctx.params.project_id;
    const startTime = new Date().getTime();
    const records = (this.records = {});
    const reports = (this.reports = {});
    const testList = [];
    let id = ctx.params.id;
    let curEnvList = this.handleEvnParams(ctx.params);
    let colData = await this.InterfaceColModel.get(id);
    if (!colData) {
      return (ctx.body = yapi.commons.resReturn(null, 40022, "id值不存在"));
    }
    let projectData = await this.ProjectModel.get(projectId);
    let caseList = await yapi.commons.getCaseList(id);
    if (caseList.errcode !== 0) {
      ctx.body = caseList;
    }
    caseList = caseList.data;
    for (let i = 0, l = caseList.length; i < l; i++) {
      let item = caseList[i];
      let projectEvn = await this.ProjectModel.getByEnv(item.project_id);
      item.id = item._id;
      let curEnvItem = _.find(curEnvList, (key) => key.project_id == item.project_id);
      item.case_env = curEnvItem ? curEnvItem.curEnv || item.case_env : item.case_env;
      item.req_headers = this.handleReqHeader(item.req_headers, projectEvn.env, item.case_env);
      item.pre_script = projectData.pre_script;
      item.after_script = projectData.after_script;
      item.env = projectEvn.env;
      let result;
      // console.log('item',item.case_env)
      try {
        result = await this.handleTest(item);
      } catch (err) {
        result = err;
      }
      reports[item.id] = result;
      records[item.id] = {
        params: result.params,
        body: result.res_body
      };
      testList.push(result);
    }
    function getMessage(testList) {
      let successNum = 0,
        failedNum = 0,
        len = 0,
        msg = "";
      testList.forEach((item) => {
        len++;
        if (item.code === 0) {
          successNum++;
        } else {
          failedNum++;
        }
      });
      if (failedNum === 0) {
        msg = `一共 ${len} 测试用例，全部验证通过`;
      } else {
        msg = `一共 ${len} 测试用例，${successNum} 个验证通过， ${failedNum} 个未通过。`;
      }
      return { msg, len, successNum, failedNum };
    }
    const endTime = new Date().getTime();
    const executionTime = (endTime - startTime) / 1000;
    let reportsResult = {
      message: getMessage(testList),
      runTime: executionTime + "s",
      numbs: testList.length,
      list: testList
    };
    if (ctx.params.email === true && reportsResult.message.failedNum !== 0) {
      let autoTestUrl = `${
        ctx.request.origin
      }/api/open/run_auto_test?id=${id}&token=${token}&mode=${ctx.params.mode}`;
      yapi.commons.sendNotice(projectId, {
        title: "YApi自动化测试报告",
        content: `
        <html>
        <head>
        <title>测试报告</title>
        <meta charset="utf-8" />
        <body>
        <div>
        <h3>测试结果：</h3>
        <p>${reportsResult.message.msg}</p>
        <h3>测试结果详情如下：</h3>
        <p>${autoTestUrl}</p>
        </div>
        </body>
        </html>`
      });
    }
    let mode = ctx.params.mode || "html";
    if (ctx.params.download === true) {
      ctx.set("Content-Disposition", `attachment; filename=test.${mode}`);
    }
    if (ctx.params.mode === "json") {
      return (ctx.body = reportsResult);
    } else {
      return (ctx.body = renderToHtml(reportsResult));
    }
  }
  async handleTest(interfaceData) {
    let requestParams = {};
    let options;
    options = handleParams(interfaceData, this.handleValue, requestParams);
    let result = {
      id: interfaceData.id,
      name: interfaceData.casename,
      path: interfaceData.path,
      code: 400,
      validRes: []
    };
    try {
      options.taskId = this.getUid();
      let data = await crossRequest(options, interfaceData.pre_script, interfaceData.after_script, createContex(
        this.getUid(),
        interfaceData.project_id,
        interfaceData.interface_id
      ));
      let res = data.res;
      result = Object.assign(result, {
        status: res.status,
        statusText: res.statusText,
        url: data.req.url,
        method: data.req.method,
        data: data.req.data,
        headers: data.req.headers,
        res_header: res.header,
        res_body: res.body
      });
      if (options.data && typeof options.data === "object") {
        requestParams = Object.assign(requestParams, options.data);
      }
      let validRes = [];
      let responseData = Object.assign(
        {},
        {
          status: res.status,
          body: res.body,
          header: res.header,
          statusText: res.statusText
        }
      );
      await this.handleScriptTest(interfaceData, responseData, validRes, requestParams);
      result.params = requestParams;
      if (validRes.length === 0) {
        result.code = 0;
        result.validRes = [{ message: "验证通过" }];
      } else if (validRes.length > 0) {
        result.code = 1;
        result.validRes = validRes;
      }
    } catch (data) {
      result = Object.assign(options, result, {
        res_header: data.header,
        res_body: data.body || data.message,
        status: null,
        statusText: data.message,
        code: 400
      });
    }
    return result;
  }
  async handleScriptTest(interfaceData, response, validRes, requestParams) {
    try {
      let test = await yapi.commons.runCaseScript({
        response: response,
        records: this.records,
        script: interfaceData.test_script,
        params: requestParams
      }, interfaceData.col_id, interfaceData.interface_id, this.getUid());
      if (test.errcode !== 0) {
        test.data.logs.forEach((item) => {
          validRes.push({
            message: item
          });
        });
      }
    } catch (err) {
      validRes.push({
        message: "Error: " + err.message
      });
    }
  }
  handleReqHeader(req_header, envData, curEnvName) {
    let currDomain = handleCurrDomain(envData, curEnvName);
    let header = currDomain.header;
    header.forEach((item) => {
      if (!checkNameIsExistInArray(item.name, req_header)) {
        item.abled = true;
        req_header.push(item);
      }
    });
    req_header = req_header.filter((item) => item && typeof item === "object");
    return req_header;
  }
}
module.exports = OpenController;