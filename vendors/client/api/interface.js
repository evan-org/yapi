/**
 * 接口管理 API
 */
import apiClient from "../utils/apiClient";
import qs from "qs";

export function fetchInterface(id) {
  return apiClient.get("/interface/get", { params: { id } });
}

export function fetchInterfaceListMenu(projectId) {
  return apiClient.get("/interface/list_menu", { params: { project_id: projectId } });
}

export function fetchInterfaceList(params) {
  return apiClient.get("/interface/list", {
    params,
    paramsSerializer: (p) => qs.stringify(p, { indices: false })
  });
}

export function fetchInterfaceCatList(params) {
  return apiClient.get("/interface/list_cat", {
    params,
    paramsSerializer: (p) => qs.stringify(p, { indices: false })
  });
}

export function deleteInterface(id) {
  return apiClient.post("/interface/del", { id });
}

export function saveInterface(data) {
  return apiClient.post("/interface/save", data);
}

export function deleteInterfaceCat(catid) {
  return apiClient.post("/interface/del_cat", { catid });
}

export function updateInterface(params) {
  return apiClient.post("/interface/up", params);
}

export function addInterface(data) {
  return apiClient.post("/interface/add", data);
}

export function addInterfaceCat(data) {
  return apiClient.post("/interface/add_cat", data);
}

export function updateInterfaceCat(params) {
  return apiClient.post("/interface/up_cat", params);
}

export function updateInterfaceIndex(changes) {
  return apiClient.post("/interface/up_index", changes);
}

export function updateInterfaceCatIndex(changes) {
  return apiClient.post("/interface/up_cat_index", changes);
}

export function schema2json(body) {
  return apiClient.post("/interface/schema2json", body);
}

export function fetchCatMenu(project_id) {
  return apiClient.get("/interface/getCatMenu", { params: { project_id } });
}
