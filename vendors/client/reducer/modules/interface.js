import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import qs from "qs";
//
const initialState = {
  curdata: {},
  list: [],
  editStatus: false, // 记录编辑页面是否有编辑,
  totalTableList: [],
  catTableList: [],
  count: 0,
  totalCount: 0
}
export const appSlice = createSlice({
  name: "interface",
  initialState: initialState,
  reducers: {
    // 初始化
    INIT_INTERFACE_DATA: (state, action) => {
      for (const stateElement of Object.keys(initialState)) {
        state[stateElement] = initialState[stateElement];
      }
    },
    //
    UPDATE_INTERFACE_DATA: (state, action) => {
      state.curdata = Object.assign({}, state.curdata, action.updata);
    },
    //
    FETCH_INTERFACE_DATA: (state, action) => {
      state.curdata = action.payload.data.data
    },
    FETCH_INTERFACE_LIST_MENU: (state, action) => {
      state.list = action.payload.data.data
    },
    CHANGE_EDIT_STATUS: (state, action) => {
      state.editStatus = action.status
    },
    FETCH_INTERFACE_LIST: (state, action) => {
      state.totalTableList = action.payload.data.data.list;
      state.totalCount = action.payload.data.data.count;
    },
    FETCH_INTERFACE_CAT_LIST: (state, action) => {
      state.catTableList = action.payload.data.data.list;
      state.count = action.payload.data.data.count;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  CHANGE_EDIT_STATUS,
  INIT_INTERFACE_DATA,
  UPDATE_INTERFACE_DATA,
  DELETE_INTERFACE_DATA,
  SAVE_IMPORT_DATA,
  DELETE_INTERFACE_CAT_DATA,
  FETCH_INTERFACE_DATA,
  FETCH_INTERFACE_LIST_MENU,
  FETCH_INTERFACE_LIST,
  FETCH_INTERFACE_CAT_LIST,
} = appSlice.actions;
export default appSlice.reducer
// 记录编辑页面是否有编辑
export function changeEditStatus(status) {
  return {
    type: CHANGE_EDIT_STATUS,
    status
  };
}
export function initInterface() {
  return {
    type: INIT_INTERFACE_DATA
  };
}
export function updateInterfaceData(updata) {
  return {
    type: UPDATE_INTERFACE_DATA,
    updata: updata,
    payload: true
  };
}
export async function deleteInterfaceData(id) {
  let result = await axios.post("/api/interface/del", { id: id });
  return {
    type: DELETE_INTERFACE_DATA,
    payload: result
  };
}
export async function saveImportData(data) {
  let result = await axios.post("/api/interface/save", data);
  return {
    type: SAVE_IMPORT_DATA,
    payload: result
  };
}
export async function deleteInterfaceCatData(id) {
  let result = await axios.post("/api/interface/del_cat", { catid: id });
  return {
    type: DELETE_INTERFACE_CAT_DATA,
    payload: result
  };
}
// Action Creators
export async function fetchInterfaceData(interfaceId) {
  let result = await axios.get("/api/interface/get?id=" + interfaceId);
  return {
    type: FETCH_INTERFACE_DATA,
    payload: result
  };
}
export async function fetchInterfaceListMenu(projectId) {
  let result = await axios.get("/api/interface/list_menu?project_id=" + projectId);
  return {
    type: FETCH_INTERFACE_LIST_MENU,
    payload: result
  };
}
export async function fetchInterfaceList(params) {
  let result = await axios.get("/api/interface/list", {
    params,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
  return {
    type: FETCH_INTERFACE_LIST,
    payload: result
  };
}
export async function fetchInterfaceCatList(params) {
  let result = await axios.get("/api/interface/list_cat", {
    params,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
  return {
    type: FETCH_INTERFACE_CAT_LIST,
    payload: result
  };
}
