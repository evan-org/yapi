/**
 * API 路径常量（静态资源、下载链接等非 axios 场景）
 */

/** API 前缀 */
export const API_PREFIX = "/api";

/**
 * 用户头像 URL（GET，二进制）
 * @param {number|string} uid
 */
export function getUserAvatarUrl(uid) {
  return `${API_PREFIX}/user/avatar?uid=${uid}`;
}

/**
 * 项目 Mock 数据下载
 * @param {number|string} projectId
 */
export function getProjectDownloadUrl(projectId) {
  return `${API_PREFIX}/project/download?project_id=${projectId}`;
}

/**
 * 拼接开放 API 文档用路径展示
 * @param {string} path 如 /open/run_auto_test
 */
export function getApiDocPath(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_PREFIX}${normalized}`;
}
