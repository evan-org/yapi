// @ts-nocheck
/**
 * 高级 Mock：Mock 响应后处理（期望匹配、脚本执行）
 */
import _ from "underscore";
import Mock from "mockjs";
import yapi from "../runtime.js";
import { isDeepMatch } from "../utils/deep-match.js";
import mockExtra from "../utils/mock-extra.js";
import { advMockRepository, advMockCaseRepository } from "../repositories/index.js";

/** 将期望 headers 数组转为响应头对象 */
function arrToObj(arr) {
  const obj = { "Set-Cookie": [] };
  arr.forEach((item) => {
    if (item.name === "Set-Cookie") {
      obj["Set-Cookie"].push(item.value);
    } else {
      obj[item.name] = item.value;
    }
  });
  return obj;
}

async function checkCase(ctx, interfaceId) {
  const reqParams = Object.assign({}, ctx.query, ctx.request.body);
  const ip = yapi.commons.getIp(ctx);
  const listWithIp = await advMockCaseRepository.listForMock(interfaceId, {
    ip_enable: true,
    ip,
  });
  const matchList = [];
  listWithIp.forEach((item) => {
    const params = item.params;
    if (item.case_enable && isDeepMatch(reqParams, params)) {
      matchList.push(item);
    }
  });
  if (matchList.length === 0) {
    const list = await advMockCaseRepository.listForMock(interfaceId, { ip_enable: false });
    list.forEach((item) => {
      const params = item.params;
      if (item.case_enable && isDeepMatch(reqParams, params)) {
        matchList.push(item);
      }
    });
  }
  if (matchList.length > 0) {
    return _.max(matchList, (item) => (item.params && Object.keys(item.params).length) || 0);
  }
  return null;
}

async function handleByCase(caseData) {
  return advMockCaseRepository.get({ _id: caseData._id });
}

/** 接口删除时清理高级 Mock 数据 */
export async function onInterfaceDeleted(interfaceId) {
  await advMockRepository.delByInterfaceId(interfaceId);
}

/** 项目删除时清理高级 Mock 数据 */
export async function onProjectDeleted(projectId) {
  await advMockRepository.delByProjectId(projectId);
}

/**
 * mock_after 逻辑：匹配期望或执行 mock 脚本
 * @param context Mock 上下文
 */
export async function applyAdvancedMockAfter(context) {
  const interfaceId = context.interfaceData._id;
  const caseData = await checkCase(context.ctx, interfaceId);
  if (caseData && caseData.case_enable) {
    const data = await handleByCase(caseData);
    context.mockJson = yapi.commons.json_parse(data.res_body);
    try {
      context.mockJson = Mock.mock(
        mockExtra(context.mockJson, {
          query: context.ctx.query,
          body: context.ctx.request.body,
          params: Object.assign({}, context.ctx.query, context.ctx.request.body),
        })
      );
    } catch (err) {
      yapi.commons.log(err, "error");
    }
    context.resHeader = arrToObj(data.headers);
    context.httpCode = data.code;
    context.delay = data.delay;
    return true;
  }
  const data = await advMockRepository.get(interfaceId);
  if (!data || !data.enable || !data.mock_script) {
    return context;
  }
  await yapi.commons.handleMockScript(data.mock_script, context);
  return context;
}
