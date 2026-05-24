/**
 * 插件相关 API（路径相对 baseURL /api）
 */
import apiClient from "../utils/apiClient";

/**
 * 高级 Mock 用例列表
 * @param {number|string} interfaceId
 */
export function fetchAdvMockCaseList(interfaceId) {
  return apiClient.get("/plugin/advmock/case/list", {
    params: { interface_id: interfaceId }
  });
}
