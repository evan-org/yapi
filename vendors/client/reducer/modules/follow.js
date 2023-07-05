import { createSlice } from "@reduxjs/toolkit";
import request from "@/service/request.js";
// Actions
export const appSlice = createSlice({
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
} = appSlice.actions;
export default appSlice.reducer
// 获取关注列表
export async function getFollowList(uid) {
  return {
    type: GET_FOLLOW_LIST,
    payload: await request.get("/follow/list", {
      params: { uid }
    })
  };
}
// 添加关注
export async function addFollow(param) {
  return {
    type: ADD_FOLLOW,
    payload: await request.post("/follow/add", param)
  };
}
// 删除关注
export async function delFollow(id) {
  return {
    type: DEL_FOLLOW,
    payload: await request.post("/follow/del", { projectid: id })
  };
}
