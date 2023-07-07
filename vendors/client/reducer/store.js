import { configureStore } from "@reduxjs/toolkit";
import { composeWithDevTools } from "redux-devtools-extension";
// import { createBrowserHistory } from "history";
// import { routerMiddleware } from "connected-react-router";
//
// import promise from "redux-promise";
import logger from "redux-logger";
// import storage from "redux-persist/lib/storage";
// import { persistStore, persistReducer } from "redux-persist";
// const persistConfig = {
//   key: "root",
//   storage,
// }
// const persistedReducer = persistReducer(persistConfig, reducer)
// const preloadedState = {
//   login: getTokenInfo(),
// }
// logger 日志
// const loggerMiddleware = createLogger();
//
// import messageMiddleware from "./middleware/messageMiddleware.js";
//
import rootReducers from "./modules/reducer.js";

// mount it on the Store
export default configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) => {
    console.log(getDefaultMiddleware());
    return getDefaultMiddleware().concat([logger])
  },
  devTools: composeWithDevTools(),
})
