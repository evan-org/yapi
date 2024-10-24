import { createSlice } from "@reduxjs/toolkit";
import type { UseDispatch } from "react-redux";

const initialState = {
  myTheme: "default",
  defaultTheme: {
    background: "#fff",
    color: "#000",
    primary: "#54458a"
  },
  darkTheme: {
    background: "#000",
    color: "#fff",
    primary: "#000"
  },
  cancelTokens: new Map()
};
export const systemSlice = createSlice({
  name: "system",
  initialState,
  reducers: {
    SET_MY_THEME: (state, action) => {
      state.myTheme = action.payload
    },
    SET_CANCEL_TOKEN(state, payload: any) {
      state.cancelTokens.set(payload.key, payload.value);
    },
    CLEAR_CANCEL_TOKEN(state, payload) {
      const cancelToken = state.cancelTokens.get(payload);
      if (cancelToken) {
        cancelToken.cancel("中断请求：" + payload);
      }
    }
  },
})
export const {
  SET_MY_THEME,
  SET_CANCEL_TOKEN,
  CLEAR_CANCEL_TOKEN
} = systemSlice.actions;
//
//
/**
 * @param value
 */
export const setCancelToken = (value: any) => async(dispatch: UseDispatch | any) => {
  console.log("push input value");
  dispatch(SET_CANCEL_TOKEN(value));
}
/**
 * @param value
 */
export const clearCancelToken = (value: any) => async(dispatch: UseDispatch | any) => {
  console.log("push input value");
  return dispatch(CLEAR_CANCEL_TOKEN(value))
}
