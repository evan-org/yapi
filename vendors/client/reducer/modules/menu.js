// Actions
import { createSlice } from "@reduxjs/toolkit";
// Reducer
const initialState = {
  curKey: "/" + window.location.hash.split("/")[1]
};
//
export const appSlice = createSlice({
  name: "menu",
  initialState: initialState,
  reducers: {
    CHANGE_MENU_ITEM: (state, action) => {
      state.curKey = action.data;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
});
//
const { CHANGE_MENU_ITEM } = appSlice.actions;
export default appSlice.reducer;
// Action Creators
export function changeMenuItem(curKey) {
  return {
    type: CHANGE_MENU_ITEM,
    data: curKey
  };
}
