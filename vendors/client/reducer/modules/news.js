// Action Creators
import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
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
export default appSlice.reducer
export async function fetchNewsData(typeid, type, page, limit, selectValue) {
  let param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  }
  return {
    type: FETCH_NEWS_DATA,
    payload: await axios.get("/api/log/list", {
      params: param
    })
  };
}
export async function fetchMoreNews(typeid, type, page, limit, selectValue) {
  const param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  }
  return {
    type: FETCH_MORE_NEWS,
    payload: await axios.get("/api/log/list", {
      params: param
    })
  };
}
export async function getMockUrl(project_id) {
  const params = { id: project_id };
  return {
    type: "",
    payload: await axios.get("/api/project/get", { params: params })
  };
}
export async function fetchUpdateLogData(params) {
  return {
    type: "",
    payload: await axios.post("/api/log/list_by_update", params)
  };
}
