// @ts-nocheck
/**
 * Wiki 模块：查询
 */
import { ok, fail } from "../service-result.js";
import { repos } from "./shared.js";

const { wikiModel } = repos;

export async function getByProjectId(projectId: number | string | undefined | null) {
  if (!projectId) {
    return fail(400, "项目id不能为空");
  }
  const result = await wikiModel.get(projectId);
  return ok(result);
}
