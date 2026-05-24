/**
 * 测试集合（interface col）API
 */
import apiClient from "../utils/apiClient";

export function fetchColList(projectId) {
  return apiClient.get("/col/list", { params: { project_id: projectId } });
}

export function fetchCase(caseid) {
  return apiClient.get("/col/case", { params: { caseid } });
}

export function fetchCaseList(colId) {
  return apiClient.get("/col/case_list/", { params: { col_id: colId } });
}

export function fetchCaseEnvList(col_id) {
  return apiClient.get("/col/case_env_list", { params: { col_id } });
}

export function fetchCaseListByVarParams(col_id) {
  return apiClient.get("/col/case_list_by_var_params", { params: { col_id } });
}

export function addCol(data) {
  return apiClient.post("/col/add_col", data);
}

export function updateCol(params) {
  return apiClient.post("/col/up_col", params);
}

export function deleteCol(col_id) {
  return apiClient.get("/col/del_col", { params: { col_id } });
}

export function addCase(data) {
  return apiClient.post("/col/add_case", data);
}

export function updateCase(params) {
  return apiClient.post("/col/up_case", params);
}

export function deleteCase(caseid) {
  return apiClient.get("/col/del_case", { params: { caseid } });
}

export function cloneCaseList(data) {
  return apiClient.post("/col/clone_case_list", data);
}

export function addCaseList(data) {
  return apiClient.post("/col/add_case_list", data);
}

export function updateCaseIndex(changes) {
  return apiClient.post("/col/up_case_index", changes);
}

export function updateColIndex(changes) {
  return apiClient.post("/col/up_col_index", changes);
}

export function runScript(data) {
  return apiClient.post("/col/run_script", data);
}
