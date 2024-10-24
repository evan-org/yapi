"use client"
import { createSlice, type PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import request from "@/shared/request.js";
import { setToken, setUserId, setUserInfo } from "@/shared/auth.js";
import type { UseDispatch } from "react-redux";
// Reducer
const LOADING_STATUS = 0;
const GUEST_STATUS = 1;
const MEMBER_STATUS = 2;
//
export const userSlice = createSlice({
  name: "user",
  initialState: {
    isLogin: false,
    canRegister: true,
    isLDAP: false,
    userName: null,
    uid: null,
    email: "",
    loginState: LOADING_STATUS,
    loginWrapActiveKey: "1",
    role: "",
    type: "",
    // breadcrumb: [{
    //   name: 'name',
    //   href: 'group'
    // }, {
    //   name: '当前页面'
    // }]
    breadcrumb: [],
    studyTip: 0,
    study: false,
    imageUrl: ""
  },
  reducers: (create) => ({
    //
    DEFINE_ERROR: create.reducer((state, action: PayloadAction<any>) => {
      console.debug("DEFINE_ERROR", action);
    }),
    //
    GET_LOGIN_STATE: create.reducer((state, action: PayloadAction<any>) => {
      state.isLogin = action.payload.data.errcode === 0;
      //
      state.isLDAP = action.payload.data.ladp;
      state.canRegister = action.payload.data.canRegister;
      //
      state.role = action.payload.data.data ? action.payload.data.data.role : null;
      state.loginState = action.payload.data.errcode === 0 ? MEMBER_STATUS : GUEST_STATUS;
      state.userName = action.payload.data.data ? action.payload.data.data.username : null;
      state.uid = action.payload.data.data ? action.payload.data.data._id : null;
      state.type = action.payload.data.data ? action.payload.data.data.type : null;
      state.study = action.payload.data.data ? action.payload.data.data.study : false;
    }),
    //
    LOGIN: create.reducer((state, action: PayloadAction<any>) => {
      console.log("reducers:LOGIN", action);
      state.isLogin = true;
      state.loginState = MEMBER_STATUS;
      state.email = action.payload.email;
      state.uid = action.payload.uid;
      state.userName = action.payload.username;
      state.role = action.payload.role;
      state.type = action.payload.type;
      state.study = action.payload.study;
    }),
    //
    LOGIN_OUT: create.reducer((state, action: PayloadAction<any>) => {
      state.isLogin = false;
      state.loginState = GUEST_STATUS;
      state.userName = null;
      state.uid = null;
      state.role = "";
      state.type = "";
      console.log("reducers:LOGIN_OUT", action);
    }),
    //
    LOGIN_TYPE: create.reducer((state, action: PayloadAction<any>) => {
      state.loginWrapActiveKey = action.payload;
    }),
    //
    REGISTER: create.reducer((state, action: PayloadAction<any>) => {
      state.isLogin = true;
      state.loginState = MEMBER_STATUS;
      state.uid = action.payload.data.data.uid;
      state.userName = action.payload.data.data.username;
      state.type = action.payload.data.data.type;
      state.study = action.payload.data.data ? action.payload.data.data.study : false;
    }),
    //
    SET_BREADCRUMB: create.reducer((state, action: PayloadAction<any>) => {
      state.breadcrumb = action.payload;
    }),
    //
    CHANGE_STUDY_TIP: create.reducer((state, action: PayloadAction<any>) => {
      state.studyTip = state.studyTip + 1;
      console.log("action:CHANGE_STUDY_TIP", action);
    }),
    //
    FINISH_STUDY: create.reducer((state, action: PayloadAction<any>) => {
      console.log("action:FINISH_STUDY", action);
      state.study = true;
      state.studyTip = 0;
    }),
    //
    SET_IMAGE_URL: create.reducer((state, action: PayloadAction<any>) => {
      state.imageUrl = action.payload;
    })
  }),
  // extraReducers: createAsyncReducers([groupList]),
})
export const {
  GET_LOGIN_STATE,
  LOGIN,
  LOGIN_OUT,
  LOGIN_TYPE,
  SET_IMAGE_URL,
  REGISTER,
  SET_BREADCRUMB,
  CHANGE_STUDY_TIP,
  FINISH_STUDY
} = userSlice.actions;
// Action Creators
// 登录状态API
export const checkLoginStatusAction = () => async(dispatch: UseDispatch | any) => {
  const result: any = await request.get("/user/status");
  return dispatch(GET_LOGIN_STATE(result));
}
export const loginAction = createAsyncThunk("user/fetchUserLogin", async(data: any, thunkAPI) => {
  // thunkAPI：一个对象，其中包含通常传递给 Redux thunk 函数的所有参数，
  // 以及其他选项(参考：https://redux-toolkit.js.org/api/createAsyncThunk#payloadcreator);
  try {
    const result = await request.post("/user/login", data);
    console.log("loginActions: /user/login", result);
    setToken(result.data.data.token);
    setUserId(result.data.data.uid);
    setUserInfo(result.data.data.info);
    const { payload } = thunkAPI.dispatch(LOGIN(result.data.data.info));
    return payload;
  } catch (error) {
    console.log("loginActions:error", error);
    return thunkAPI.rejectWithValue(error);
  }
});
// 登录API
// export const loginActions = (payload: any) => async(dispatch: any) => {
//   //
//   const result = await request.post("/user/login", payload);
//   console.log("loginActions: /user/login", result);
//   setToken(result.data.data.token);
//   setUserId(result.data.data.uid);
//   setUserInfo(result.data.data.info);
//   // return dispatch(LOGIN(result.data.data.info));
//   return dispatch({ type: "user/LOGIN", payload: result.data.data.info });
// }
// 登录API
export const userInfoActions = () => async(dispatch: any) => {
  //
  const result = await request.post("/user/profile");
  console.log("loginActions: /user/login", result);
  setUserId(result.data.data.userId);
  setUserInfo(result.data.data);
  return dispatch({ type: "user/LOGIN", payload: result.data.data });
}
// 登录API
export const loginLdapActions = (payload: any) => async(dispatch: UseDispatch | any) => {
  const result = await request.post("/user/login_by_ldap", payload);
  return dispatch(LOGIN(result.data));
}
export const regActions = (payload: any) => async(dispatch: UseDispatch | any) => {
  const { email, password, userName } = payload;
  const params = { email, password, username: userName };
  const result: any = await request.post("/user/reg", params);
  return dispatch(REGISTER(result));
}
export const logoutActions = () => async(dispatch: UseDispatch | any) => {
  const result = await request.get("/user/logout");
  return dispatch(LOGIN_OUT(result));
}
export const loginTypeAction = (payload: any) => async(dispatch: UseDispatch | any) => {
  console.debug("action:loginTypeAction", payload)
  return dispatch(LOGIN_TYPE(payload))
}
export const setBreadcrumb = (payload: any) => async(dispatch: UseDispatch | any) => {
  console.debug("action:setBreadcrumb", payload)
  return dispatch(SET_BREADCRUMB(payload));
}
export const setImageUrl = (payload: any) => async(dispatch: UseDispatch | any) => {
  console.debug("action:setImageUrl", payload)
  return dispatch(SET_IMAGE_URL(payload));
}
export const changeStudyTip = (payload: any) => async(dispatch: UseDispatch | any) => {
  console.debug("action:changeStudyTip", payload)
  return dispatch(CHANGE_STUDY_TIP(payload));
}
export const finishStudy = () => async(dispatch: UseDispatch | any) => {
  const result = await request.get("/user/up_study");
  return dispatch({ type: "user/FINISH_STUDY", payload: { data: result.data } });
}
