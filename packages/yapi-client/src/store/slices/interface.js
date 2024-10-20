"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "packages/yapi-client/src/shared/request.js";
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
export const interfaceSlice = createSlice({
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
      state.curdata = Object.assign({}, state.curdata, action.payload);
    },
    //
    FETCH_INTERFACE_DATA: (state, action) => {
      state.curdata = action.payload.data.data
    },
    FETCH_INTERFACE_LIST_MENU: (state, action) => {
      state.list = action.payload.data.data;
    },
    CHANGE_EDIT_STATUS: (state, action) => {
      state.editStatus = action.payload;
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
} = interfaceSlice.actions;




// 记录编辑页面是否有编辑
export const changeEditStatus = (status) => async(dispatch, getState) => {
  console.log(status);
  return dispatch(CHANGE_EDIT_STATUS(status))
}
//
export const initInterface = () => async(dispatch, getState) => {
  console.debug("initInterface:INIT_INTERFACE_DATA");
  return dispatch(INIT_INTERFACE_DATA());
}
//
export const updateInterfaceData = (update_data) => async(dispatch, getState) => {
  console.debug("updateInterfaceData", update_data);
  return dispatch(UPDATE_INTERFACE_DATA(update_data));
}
//
export const deleteInterfaceData = (id) => async(dispatch, getState) => {
  const result = await request.post("/interface/del", { id: id });
  return dispatch(DELETE_INTERFACE_DATA({ data: result.data }));
}
//
export const saveImportData = (data) => async(dispatch, getState) => {
  const result = await request.post("/interface/save", data);
  return dispatch(SAVE_IMPORT_DATA({ data: result.data }));
}
//
export const deleteInterfaceCatData = (id) => async(dispatch, getState) => {
  let result = await request.post("/interface/del_cat", { catid: id });
  return dispatch(DELETE_INTERFACE_CAT_DATA({ data: result.data }));
}
// Action Creators
export const fetchInterfaceData = (interfaceId) => async(dispatch, getState) => {
  const result = await request.get("/interface/get?id=" + interfaceId);
  return dispatch(FETCH_INTERFACE_DATA({ data: result.data }));
}
//
export const fetchInterfaceListMenu = (projectId) => async(dispatch, getState) => {
  const result = await request.get("/interface/list_menu?project_id=" + projectId);
  return dispatch(FETCH_INTERFACE_LIST_MENU({ data: result.data }));
}
//
export const fetchInterfaceList = (params) => async(dispatch, getState) => {
  const result = await request.get("/interface/list", {
    params,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
  return dispatch(FETCH_INTERFACE_LIST({ data: result.data }));
}
//
export const fetchInterfaceCatList = (params) => async(dispatch, getState) => {
  const result = await request.get("/interface/list_cat", {
    params,
    paramsSerializer: (params) => qs.stringify(params, { indices: false })
  })
  return dispatch(FETCH_INTERFACE_CAT_LIST({ data: result.data }));
}
