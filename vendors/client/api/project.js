/**
 * 项目相关 API
 */
import apiClient from "../utils/apiClient";

export function fetchProjectList(params) {
  return apiClient.get("/project/list", { params });
}

export function fetchProject(id) {
  return apiClient.get("/project/get", { params: { id } });
}

export function addProject(param) {
  return apiClient.post("/project/add", param);
}

export function updateProject(param) {
  return apiClient.post("/project/up", param);
}

export function deleteProject(param) {
  return apiClient.post("/project/del", param);
}

export function copyProject(params) {
  return apiClient.post("/project/copy", params);
}

export function fetchProjectEnv(project_id) {
  return apiClient.get("/project/get_env", { params: { project_id } });
}

export function updateProjectEnv(param) {
  return apiClient.post("/project/up_env", param);
}
