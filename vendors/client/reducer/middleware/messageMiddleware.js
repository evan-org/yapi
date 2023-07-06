import { message } from "antd";

function isPromise(obj) {
  return obj && Object.prototype.toString.call(obj) === "[object Promise]"
}
export default (store) => (next) => async(action) => {
  if (!action) {
    return;
  }
  // // 在派发 action 前执行的逻辑
  // console.error("Dispatching action:", store, action, isPromise(action));
  // if (isPromise(action)) {
  //   try {
  //     const actionThen = await action;
  //     console.log("111111111", actionThen);
  //     return next(actionThen.data);
  //   } catch (e) {
  //     return;
  //   }
  // }
  // if (action.error) {
  //   message.error((action.payload && action.payload.message) || "服务器错误");
  // } else if (
  //   action.payload &&
  //   action.payload.data &&
  //   action.payload.data.errcode &&
  //   action.payload.data.errcode !== 40011
  // ) {
  //   message.error(action.payload.data.errmsg);
  //   throw new Error(action.payload.data.errmsg);
  // }
  return next(action);
};
