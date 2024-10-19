import { createSlice } from "@reduxjs/toolkit";
import request from "@/service/request.js";
// Reducer
const initialState = {
  list: []
};
export const appSlice = createSlice({
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
} = appSlice.actions;
export default appSlice.reducer
// Action Creators
export const fetchMockCol = (interfaceId) => async(dispatch, getState) => {
  let result = await request.get("/plugin/advmock/case/list?interface_id=" + interfaceId);
  return dispatch(FETCH_MOCK_COL({ data: result.data }));
}
