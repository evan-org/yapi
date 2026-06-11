// @ts-nocheck
/**
 * 测试集合模块：项目信息加载（鉴权辅助）
 */
import { ok, fail } from "../service-result.js";
import { repos } from "./shared.js";

const { projectModel } = repos;

export async function getProjectBaseInfo(projectId) {
  const project = await projectModel.getBaseInfo(projectId);
  if (!project) {
    return fail(407, "不存在的项目");
  }
  return ok(project);
}
