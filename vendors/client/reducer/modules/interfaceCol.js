import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
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
export async function fetchInterfaceColList(projectId) {
  return {
    type: FETCH_INTERFACE_COL_LIST,
    payload: await axios.get("/api/col/list?project_id=" + projectId)
  };
}
export async function fetchCaseData(caseId) {
  return {
    type: FETCH_CASE_DATA,
    payload: await axios.get("/api/col/case?caseid=" + caseId)
  };
}
export async function fetchCaseList(colId) {
  return {
    type: FETCH_CASE_LIST,
    payload: await axios.get("/api/col/case_list/?col_id=" + colId)
  };
}
export async function fetchCaseEnvList(col_id) {
  return {
    type: FETCH_CASE_ENV_LIST,
    payload: await axios.get("/api/col/case_env_list", {
      params: { col_id }
    })
  };
}
export async function fetchVariableParamsList(colId) {
  return {
    type: FETCH_VARIABLE_PARAMS_LIST,
    payload: await axios.get("/api/col/case_list_by_var_params?col_id=" + colId)
  };
}
export function setColData(data) {
  return {
    type: SET_COL_DATA,
    payload: data
  };
}
