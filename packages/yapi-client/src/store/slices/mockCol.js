"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "@/shared/request.js";
// Reducer
const initialState = {
  list: []
};
export const mockColSlice = createSlice({
  name: "mockCol",
  initialState: initialState,
  reducers: {
    FETCH_MOCK_COL: (state, action) => {
      state.list = action.payload.data;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  FETCH_MOCK_COL,
} = mockColSlice.actions;
// Action Creators
export const fetchMockCol = (interfaceId) => async(dispatch, getState) => {
  let result = await request.get("/plugin/advmock/case/list?interface_id=" + interfaceId);
  return dispatch(FETCH_MOCK_COL({ data: result.data }));
}
