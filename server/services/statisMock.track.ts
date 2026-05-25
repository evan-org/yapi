// @ts-nocheck
/**
 * Mock 调用统计：每次 mock 成功后写入 statis_mock
 */
import yapi from "../runtime.js";
import { statisMockRepository } from "../repositories/index.js";
import { formatYMD } from "./statistics.util.js";

/** Mock 完成后记录统计 */
export function trackMockStatistics(context) {
  const interfaceId = context.interfaceData._id;
  const projectId = context.projectData._id;
  const groupId = context.projectData.group_id;
  const ip = yapi.commons.getIp(context.ctx);
  const data = {
    interface_id: interfaceId,
    project_id: projectId,
    group_id: groupId,
    time: yapi.commons.time(),
    ip,
    date: formatYMD(new Date()),
  };
  try {
    statisMockRepository.save(data).then();
  } catch (e) {
    yapi.commons.log("mockStatisError", e);
  }
}
