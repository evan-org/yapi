import { configureStore } from "@reduxjs/toolkit";
import promiseMiddleware from "redux-promise";
import messageMiddleware from "./middleware/messageMiddleware";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";
// logger 日志
const loggerMiddleware = createLogger();
import rootReducers from "./modules/reducer";
// mount it on the Store
export default configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(thunkMiddleware, messageMiddleware, promiseMiddleware, loggerMiddleware)
})
