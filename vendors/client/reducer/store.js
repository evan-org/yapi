import { configureStore } from "@reduxjs/toolkit";
import promiseMiddleware from "redux-promise";
import thunkMiddleware from "redux-thunk";
import logger from "redux-logger";
// logger 日志
// const loggerMiddleware = createLogger();
//
import messageMiddleware from "./middleware/messageMiddleware.js";
//
import rootReducers from "./modules/reducer.js";
// mount it on the Store
export default configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(promiseMiddleware, thunkMiddleware, logger, messageMiddleware)
})
