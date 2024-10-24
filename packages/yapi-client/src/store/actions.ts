import request from "@/shared/request";
import { setToken, setUserId, setUserInfo } from "@/shared/auth";
import { dis } from "react-redux";

export const loginActions = (payload: any) => async(dispatch: any) => {
  //
  const result = await request.post("/user/login", payload);
  console.log("loginActions: /user/login", result);
  setToken(result.data.data.token);
  setUserId(result.data.data.uid);
  setUserInfo(result.data.data.info);
  // return dispatch(LOGIN(result.data.data.info));
  return dispatch({ type: "user/LOGIN", payload: result.data.data.info });
}
