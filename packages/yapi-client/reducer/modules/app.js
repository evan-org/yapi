// Action Creators
import { createSlice } from "@reduxjs/toolkit";
// Actions
export const appSlice = createSlice({
  name: "app",
  initialState: {
    theme: "light",
    cancelTokens: new Map()
  },
  reducers: {
    SET_CANCEL_TOKEN(state, payload) {
      state.cancelTokens.set(payload.key, payload.value);
    },
    CLEAR_CANCEL_TOKEN(state, payload) {
      const cancelToken = state.cancelTokens.get(payload);
      if (cancelToken) {
        cancelToken.cancel("中断请求：" + payload);
      }
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const { SET_CANCEL_TOKEN, CLEAR_CANCEL_TOKEN } = appSlice.actions;
export default appSlice.reducer;
/**
 *
 * @param {{key: string, value: any}} value
 * @return {function(*, *): Promise<*>}
 */
export const setCancelToken = (value) => async(dispatch, getState) => {
  console.log("push input value");
  dispatch(SET_CANCEL_TOKEN(value))
}
/**
 *
 * @param {{key: string, value: any}} value
 * @return {function(*, *): Promise<*>}
 */
export const clearCancelToken = (value) => async(dispatch, getState) => {
  console.log("push input value");
  return dispatch(CLEAR_CANCEL_TOKEN(value))
}
