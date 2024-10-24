"use client"
import { combineReducers, configureStore, type Action, type  ThunkAction } from "@reduxjs/toolkit";

export type RootState = ReturnType<typeof rootReducer>;
// import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
//
import { systemSlice } from "@/store/slices/system.ts";
import { userSlice } from "@/store/slices/user.ts";
import { groupSlice } from "@/store/slices/group.js";
import { projectSlice } from "@/store/slices/project.js";
import { interfaceSlice } from "@/store/slices/interface.js";
import { interfaceColSlice } from "@/store/slices/interfaceCol.js";
import { newsSlice } from "@/store/slices/news.js";
import { addInterfaceSlice } from "@/store/slices/addInterface.js";
import { menuSlice } from "@/store/slices/menu.js";
import { followSlice } from "@/store/slices/follow.js";
import { mockColSlice } from "@/store/slices/mockCol.js";
// 创建 reducer器
const rootReducer = combineReducers({
  [systemSlice.name]: systemSlice.reducer,
  [userSlice.name]: userSlice.reducer,
  [groupSlice.name]: groupSlice.reducer,
  [projectSlice.name]: projectSlice.reducer,
  [interfaceSlice.name]: interfaceSlice.reducer,
  [interfaceColSlice.name]: interfaceColSlice.reducer,
  [newsSlice.name]: newsSlice.reducer,
  [addInterfaceSlice.name]: addInterfaceSlice.reducer,
  [menuSlice.name]: menuSlice.reducer,
  [followSlice.name]: followSlice.reducer,
  [mockColSlice.name]: mockColSlice.reducer,
});
//
export const makeStore = () =>
  // mount it on the Store
  configureStore({
    reducer: rootReducer,
    // devTools: composeWithDevTools(),
    devTools: false,
    // middleware: new MiddlewareArray().concat(logger),
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({
      serializableCheck: false, // 禁用序列化检查
    }).concat(logger)
  })
;
// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
