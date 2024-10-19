"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "../../shared/request.js";
// Reducer
const initialState = {
  interfaceColList: [
    {
      _id: 0,
      name: "",
      uid: 0,
      project_id: 0,
      desc: "",
      add_time: 0,
      up_time: 0,
      caseList: [{}]
    }
  ],
  isShowCol: true,
  isRender: false,
  currColId: 0,
  currCaseId: 0,
  currCase: {},
  currCaseList: [],
  variableParamsList: [],
  envList: []
};
export const appSlice = createSlice({
  name: "interfaceCol",
  initialState: initialState,
  reducers: {
    //
    FETCH_INTERFACE_COL_LIST: (state, action) => {
      state.interfaceColList = action.payload.data.data;
    },
    //
    FETCH_CASE_DATA: (state, action) => {
      state.currCase = action.payload.data.data;
    },
    //
    FETCH_CASE_LIST: (state, action) => {
      state.currCaseList = action.payload.data.data;
    },
    //
    FETCH_VARIABLE_PARAMS_LIST: (state, action) => {
      state.variableParamsList = action.payload.data.data;
    },
    //
    SET_COL_DATA: (state, action) => {
      if (action.payload instanceof "object") {
        for (const stateElement of Object.keys(action.payload)) {
          state[stateElement] = action.payload[stateElement];
        }
      }
    },
    //
    FETCH_CASE_ENV_LIST: (state, action) => {
      state.envList = action.payload.data.data;
    },
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  FETCH_INTERFACE_COL_LIST,
  FETCH_CASE_DATA,
  FETCH_CASE_LIST,
  FETCH_VARIABLE_PARAMS_LIST,
  SET_COL_DATA,
  FETCH_CASE_ENV_LIST
} = appSlice.actions;
export default appSlice.reducer
// Action Creators
export const fetchInterfaceColList = (projectId) => async(dispatch, getState) => {
  const result = await request.get("/col/list", { project_id: projectId });
  return dispatch(FETCH_INTERFACE_COL_LIST({ data: result.data }));
}
//
export const fetchCaseData = (caseId) => async(dispatch, getState) => {
  const result = await request.get("/col/case?caseid=" + caseId);
  return dispatch(FETCH_CASE_DATA({ data: result.data }));
}
//
export const fetchCaseList = (colId) => async(dispatch, getState) => {
  const result = await request.get("/col/case_list/?col_id=" + colId);
  return dispatch(FETCH_CASE_LIST({ data: result.data }));
}
//
export const fetchCaseEnvList = (col_id) => async(dispatch, getState) => {
  const result = await request.get("/col/case_env_list", { col_id });
  return dispatch(FETCH_CASE_ENV_LIST({ data: result.data }));
}
//
export const fetchVariableParamsList = (colId) => async(dispatch, getState) => {
  const result = await request.get("/col/case_list_by_var_params?col_id=" + colId);
  return dispatch(FETCH_VARIABLE_PARAMS_LIST({ data: result.data }));
}
//
export const setColData = (data) => async(dispatch, getState) => {
  console.log("setColData", data);
  return dispatch(SET_COL_DATA(data));
}
