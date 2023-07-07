// Action Creators
import { createSlice } from "@reduxjs/toolkit";
import request from "@/service/request.js";
import variable from "../../utils/variable";
// Reducer
const initialState = {
  newsData: {
    list: [],
    total: 0
  },
  curpage: 1
};
export const appSlice = createSlice({
  name: "news",
  initialState: initialState,
  reducers: {
    FETCH_NEWS_DATA: (state, action) => {
      const list = action.payload.data.data.list;
      list.sort(function(a, b) {
        return b.add_time - a.add_time;
      });
      state.newsData = {
        curpage: 1,
        total: action.payload.data.data.total,
        list: list
      }
    },
    FETCH_MORE_NEWS: (state, action) => {
      const list = [...state.newsData.list, ...action.payload.data.data.list];
      list.sort(function(a, b) {
        return b.add_time - a.add_time;
      });
      if (list && list.length) {
        state.curpage++;
      }
      state.newsData = {
        curpage: 1,
        total: action.payload.data.data.total,
        list: list
      }
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
// actions
const { FETCH_NEWS_DATA, FETCH_MORE_NEWS } = appSlice.actions;
export default appSlice.reducer;
//
export const fetchNewsData = (typeid, type, page, limit, selectValue) => async(dispatch, getState) => {
  const param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  }
  const result = await request.get("/log/list", param);
  return dispatch(FETCH_NEWS_DATA({ data: result.data }));
}
//
export const fetchMoreNews = (typeid, type, page, limit, selectValue) => async(dispatch, getState) => {
  const param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  }
  const result = await request.get("/log/list", param);
  return dispatch(FETCH_MORE_NEWS({ data: result.data }));
}
//
export const getMockUrl = (project_id) => async(dispatch, getState) => {
  const result = await request.get("/project/get", { id: project_id });
  return { type: null, payload: result };
}
//
export const fetchUpdateLogData = (params) => async(dispatch, getState) => {
  const result = await request.post("/log/list_by_update", params);
  return { type: null, payload: result };
}
