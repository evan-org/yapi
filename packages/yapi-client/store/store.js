import { configureStore } from "@reduxjs/toolkit";
import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
//
import rootReducers from "../store/modules/reducer.js";

// mount it on the Store
export default configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) => {
    console.log(getDefaultMiddleware());
    return getDefaultMiddleware().concat([logger])
  },
  devTools: composeWithDevTools(),
})
