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

export function upsetProject(param) {
  return apiClient.post("/project/upset", param);
}

export function addProjectMember(param) {
  return apiClient.post("/project/add_member", param);
}

export function removeProjectMember(param) {
  return apiClient.post("/project/del_member", param);
}

export function changeProjectMemberRole(param) {
  return apiClient.post("/project/change_member_role", param);
}

export function changeProjectMemberEmailNotice(param) {
  return apiClient.post("/project/change_member_email_notice", param);
}

export function fetchProjectMemberList(id) {
  return apiClient.get("/project/get_member_list", { params: { id } });
}

export function fetchProjectToken(project_id) {
  return apiClient.get("/project/token", { params: { project_id } });
}

export function updateProjectToken(project_id) {
  return apiClient.get("/project/update_token", { params: { project_id } });
}

export function checkProjectName(name, group_id) {
  return apiClient.get("/project/check_project_name", { params: { name, group_id } });
}

export function fetchSwaggerUrl(url) {
  return apiClient.get("/project/swagger_url", {
    params: { url: encodeURI(encodeURI(url)) }
  });
}

export function updateProjectTag(params) {
  return apiClient.post("/project/up_tag", params);
}
