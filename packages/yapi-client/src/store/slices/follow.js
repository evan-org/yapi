"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "@/shared/request.js";
// Actions
export const followSlice = createSlice({
  name: "follow",
  initialState: {
    data: []
  },
  reducers: {
    GET_FOLLOW_LIST: (state, action) => {
      state.data = action.payload.data.data;
    },
    ADD_FOLLOW: (state, action) => {
      // state.data = action.payload.data.data;
    },
    DEL_FOLLOW: (state, action) => {
      // state.data = action.payload.data.data;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  GET_FOLLOW_LIST,
  DEL_FOLLOW,
  ADD_FOLLOW
} = followSlice.actions;
// 获取关注列表
export const getFollowList = (uid) => async(dispatch, getState) => {
  const result = await request.get("/follow/list", { uid });
  return dispatch(GET_FOLLOW_LIST({ data: result.data }));
}
// 添加关注
export const addFollow = (param) => async(dispatch, getState) => {
  const result = await request.post("/follow/add", param);
  return dispatch(ADD_FOLLOW({ data: result.data }));
}
// 删除关注
export const delFollow = (id) => async(dispatch, getState) => {
  const result = await request.post("/follow/del", { projectid: id });
  return dispatch(DEL_FOLLOW({ data: result.data }));
}
