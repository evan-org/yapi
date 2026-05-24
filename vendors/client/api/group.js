/**
 * 分组相关 API
 */
import apiClient from "../utils/apiClient";

export function fetchGroup(id) {
  return apiClient.get("/group/get", { params: { id } });
}

export function fetchGroupList() {
  return apiClient.get("/group/list");
}

export function fetchMyGroup() {
  return apiClient.get("/group/get_mygroup");
}

export function addGroupMember(param) {
  return apiClient.post("/group/add_member", param);
}

export function removeGroupMember(param) {
  return apiClient.post("/group/del_member", param);
}

export function changeGroupMemberRole(param) {
  return apiClient.post("/group/change_member_role", param);
}

export function updateGroup(param) {
  return apiClient.post("/group/up", param);
}

export function deleteGroup(param) {
  return apiClient.post("/group/del", param);
}

export function fetchGroupMemberList(params) {
  return apiClient.get("/group/get_member_list", { params });
}

export function addGroup(data) {
  return apiClient.post("/group/add", data);
}
