import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension"
import promiseMiddleware from "redux-promise";
import messageMiddleware from "./middleware/messageMiddleware";
import thunkMiddleware from "redux-thunk";
import { createLogger } from "redux-logger";
import reducers from "./modules/reducer";
// logger 日志
const loggerMiddleware = createLogger();
// mount it on the Store
export default createStore(
  reducers,
  composeWithDevTools(
    applyMiddleware(
      thunkMiddleware, // 允许我们 dispatch() 函数
      promiseMiddleware,
      messageMiddleware,
      loggerMiddleware // 一个很便捷的 middleware，用来打印 action 日志
    )
  )
)
