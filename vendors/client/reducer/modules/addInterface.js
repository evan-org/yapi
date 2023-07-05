// Action Creators
import { createSlice } from "@reduxjs/toolkit";
import request from "@/service/request.js";
// Actions
export const appSlice = createSlice({
  name: "addInterface",
  initialState: {
    interfaceName: "",
    url: "",
    method: "GET",
    // 默认请求头部有一条数据
    seqGroup: [
      {
        id: 0,
        name: "",
        value: ""
      }
    ],
    reqParams: "",
    resParams: "",
    project: {},
    clipboard: {}
  },
  reducers: {
    FETCH_ADD_INTERFACE_INPUT: (state, action) => {
      state.url = action.payload;
    },
    FETCH_ADD_INTERFACE_TAG_VALUE: (state, action) => {
      state.tagValue = action.payload;
    },
    FETCH_ADD_INTERFACE_HEADER_VALUE: (state, action) => {
      state.headerValue = action.payload;
    },
    ADD_INTERFACE_SEQ_HEADER: (state, action) => {
      state.seqGroup = action.payload;
    },
    DELETE_INTERFACE_SEQ_HEADER: (state, action) => {
      state.seqGroup = action.payload;
    },
    GET_INTERFACE_REQ_PARAMS: (state, action) => {
      state.reqParams = action.payload;
    },
    GET_INTERFACE_RES_PARAMS: (state, action) => {
      state.reqParams = action.payload;
    },
    PUSH_INTERFACE_NAME: (state, action) => {
      state.interfaceName = action.payload;
    },
    PUSH_INTERFACE_METHOD: (state, action) => {
      state.method = action.payload;
    },
    FETCH_INTERFACE_PROJECT: (state, action) => {
      state.project = action.payload;
    },
    ADD_INTERFACE_CLIPBOARD: (state, action) => {
      state.clipboard = action.payload;
    },
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  FETCH_ADD_INTERFACE_INPUT,
  FETCH_ADD_INTERFACE_TAG_VALUE,
  FETCH_ADD_INTERFACE_HEADER_VALUE,
  ADD_INTERFACE_SEQ_HEADER,
  DELETE_INTERFACE_SEQ_HEADER,
  GET_INTERFACE_REQ_PARAMS,
  PUSH_INTERFACE_NAME,
  PUSH_INTERFACE_METHOD,
  FETCH_INTERFACE_PROJECT,
  ADD_INTERFACE_CLIPBOARD
} = appSlice.actions;
export default appSlice.reducer
export function pushInputValue(value) {
  return {
    type: FETCH_ADD_INTERFACE_INPUT,
    payload: value
  };
}
export function reqTagValue(value) {
  return {
    type: FETCH_ADD_INTERFACE_TAG_VALUE,
    payload: value
  };
}
export function reqHeaderValue(value) {
  return {
    type: FETCH_ADD_INTERFACE_HEADER_VALUE,
    payload: value
  };
}
export function addReqHeader(value) {
  return {
    type: ADD_INTERFACE_SEQ_HEADER,
    payload: value
  };
}
export function deleteReqHeader(value) {
  return {
    type: DELETE_INTERFACE_SEQ_HEADER,
    payload: value
  };
}
export function getReqParams(value) {
  return {
    type: GET_INTERFACE_REQ_PARAMS,
    payload: value
  };
}
export function getResParams(value) {
  return {
    type: GET_INTERFACE_RES_PARAMS,
    payload: value
  };
}
export function pushInterfaceName(value) {
  return {
    type: PUSH_INTERFACE_NAME,
    payload: value
  };
}
export function pushInterfaceMethod(value) {
  return {
    type: PUSH_INTERFACE_METHOD,
    payload: value
  };
}
export async function fetchInterfaceProject(id) {
  return {
    type: FETCH_INTERFACE_PROJECT,
    payload: await request.get("/project/get", { params: { id } })
  };
}
export function addInterfaceClipboard(func) {
  return {
    type: ADD_INTERFACE_CLIPBOARD,
    payload: func
  };
}
