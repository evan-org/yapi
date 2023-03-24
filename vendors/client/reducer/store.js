import { applyMiddleware, legacy_createStore as createStore } from "redux"
// import createSagaMiddleware from 'redux-saga'
import promiseMiddleware from "redux-promise";
import messageMiddleware from "./middleware/messageMiddleware";
import thunkMiddleware from "redux-thunk"
import { createLogger } from "redux-logger"
import reducers from "./modules/reducer"
// logger 日志
const loggerMiddleware = createLogger();
console.log("sss");
// create the saga middleware
// const sagaMiddleware = createSagaMiddleware()
// mount it on the Store
export default createStore(
  reducers,
  applyMiddleware(
    promiseMiddleware,
    messageMiddleware,
    thunkMiddleware, // 允许我们 dispatch() 函数
    loggerMiddleware // 一个很便捷的 middleware，用来打印 action 日志
  )
)


