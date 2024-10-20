"use client"
import { createSlice } from "@reduxjs/toolkit";
// Reducer
const initialState = {
  curKey: null
};
//
export const menuSlice = createSlice({
  name: "menu",
  initialState: initialState,
  reducers: {
    CHANGE_MENU_ITEM: (state, action) => {
      state.curKey = action.payload;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
});
//
const { CHANGE_MENU_ITEM } = menuSlice.actions;
// Action Creators
export const changeMenuItem = (curKey) => async(dispatch, getState) => {
  console.log(curKey);
  return dispatch(CHANGE_MENU_ITEM(curKey));
}
