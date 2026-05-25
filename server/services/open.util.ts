/**
 * 开放 API 模块纯函数（环境解析、测试结果汇总等，便于单测）
 */
import {
  handleCurrDomain,
  checkNameIsExistInArray,
} from "../common/postmanLib.js";
import { trim } from "../utils/commons.js";

/**
 * 解析自动化测试 env_* 环境参数
 */
export function parseEnvParams(params: Record<string, string | undefined>) {
  const result: Array<{ curEnv: string; project_id: string }> = [];
  Object.keys(params || {}).forEach((item) => {
    if (/env_/gi.test(item)) {
      const curEnv = trim(params[item]);
      result.push({ curEnv, project_id: item.split("_")[1] });
    }
  });
  return result;
}

/**
 * 汇总测试用例执行结果
 */
export function summarizeTestResults(testList: Array<{ code?: number }>) {
  let successNum = 0;
  let failedNum = 0;
  let len = 0;
  testList.forEach((item) => {
    len++;
    if (item.code === 0) {
      successNum++;
    } else {
      failedNum++;
    }
  });
  let msg;
  if (failedNum === 0) {
    msg = `一共 ${len} 测试用例，全部验证通过`;
  } else {
    msg = `一共 ${len} 测试用例，${successNum} 个验证通过， ${failedNum} 个未通过。`;
  }
  return { msg, len, successNum, failedNum };
}

/**
 * 合并项目环境 header 到用例请求头
 */
export function mergeEnvReqHeaders(
  req_header: Array<Record<string, unknown>>,
  envData: Array<Record<string, unknown>>,
  curEnvName: string
) {
  const currDomain = handleCurrDomain(envData, curEnvName);
  const header = currDomain.header;
  header.forEach((item) => {
    if (!checkNameIsExistInArray(item.name, req_header)) {
      item.abled = true;
      req_header.push(item);
    }
  });
  return req_header.filter((item) => item && typeof item === "object");
}
