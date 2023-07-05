import { message } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export default () => (next) => (action) => {
  const location = useLocation();
  console.log("messageMiddleware =====>", location, action);
  if (!action) {
    return;
  }
  if (action.error) {
    message.error((action.payload && action.payload.message) || "服务器错误");
  } else if (
    action.payload &&
    action.payload.data &&
    action.payload.data.errcode &&
    action.payload.data.errcode !== 40011
  ) {
    message.error(action.payload.data.errmsg);
    throw new Error(action.payload.data.errmsg);
  }
  return next(action);
};
