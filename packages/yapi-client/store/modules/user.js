"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "@shared/request.js";
import { setToken, setUserId, setUserInfo } from "@shared/auth.js";
// Reducer
const LOADING_STATUS = 0;
const GUEST_STATUS = 1;
const MEMBER_STATUS = 2;
// Reducer user
const initialState = {
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
};
//
export const appSlice = createSlice({
  name: "user",
  initialState: initialState,
  reducers: {
    DEFINE_ERROR: (state, action) => {
      console.debug("DEFINE_ERROR", action);
    },
    GET_LOGIN_STATE: (state, action) => {
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
    },
    //
    LOGIN: (state, action) => {
      console.log("reducers:LOGIN", action);
      state.isLogin = true;
      state.loginState = MEMBER_STATUS;
      state.uid = action.payload.uid;
      state.userName = action.payload.username;
      state.role = action.payload.role;
      state.type = action.payload.type;
      state.study = action.payload.study;
    },
    LOGIN_OUT: (state, action) => {
      state.isLogin = false;
      state.loginState = GUEST_STATUS;
      state.userName = null;
      state.uid = null;
      state.role = "";
      state.type = "";
    },
    LOGIN_TYPE: (state, action) => {
      state.loginWrapActiveKey = action.payload;
    },
    REGISTER: (state, action) => {
      state.isLogin = true;
      state.loginState = MEMBER_STATUS;
      state.uid = action.payload.data.data.uid;
      state.userName = action.payload.data.data.username;
      state.type = action.payload.data.data.type;
      state.study = action.payload.data.data ? action.payload.data.data.study : false;
    },
    //
    SET_BREADCRUMB: (state, action) => {
      state.breadcrumb = action.payload;
    },
    CHANGE_STUDY_TIP: (state, action) => {
      state.studyTip = state.studyTip + 1
    },
    FINISH_STUDY: (state, action) => {
      state.study = true;
      state.studyTip = 0;
    },
    SET_IMAGE_URL: (state, action) => {
      state.imageUrl = action.payload;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  GET_LOGIN_STATE,
  LOGIN,
  LOGIN_OUT,
  LOGIN_TYPE,
  SET_IMAGE_URL,
  REGISTER,
  SET_BREADCRUMB,
  CHANGE_STUDY_TIP,
  FINISH_STUDY
} = appSlice.actions;
export default appSlice.reducer;
// Action Creators
export const checkLoginState = (payload) => async(dispatch, getState) => {
  const result = await request.get("/user/status");
  return dispatch(GET_LOGIN_STATE({ data: result.data }))
}
// 登录API
export const loginActions = (payload) => async(dispatch, getState) => {
  const result = await request.post("/user/login", payload);
  console.log("loginActions: /user/login", result);
  setToken(result.data.data.token);
  setUserId(result.data.data.uid);
  setUserInfo(result.data.data.info);
  return dispatch(LOGIN(result.data.data.info));
}
// 登录API
export const loginLdapActions = (payload) => async(dispatch, getState) => {
  const result = await request.post("/user/login_by_ldap", payload);
  return dispatch(LOGIN(result.data));
}
export const regActions = (payload) => async(dispatch, getState) => {
  const { email, password, userName } = payload;
  const params = { email, password, username: userName };
  const result = await request.post("/user/reg", params);
  return dispatch(REGISTER({ data: result.data }));
}
export const logoutActions = (payload) => async(dispatch, getState) => {
  const result = await request.get("/user/logout");
  return dispatch(LOGIN_OUT({ data: result.data }));
}
export const loginTypeAction = (payload) => async(dispatch, getState) => {
  console.debug("action:loginTypeAction", payload)
  return dispatch(LOGIN_TYPE(payload))
}
export const setBreadcrumb = (payload) => async(dispatch, getState) => {
  console.debug("action:setBreadcrumb", payload)
  return dispatch(SET_BREADCRUMB(payload));
}
export const setImageUrl = (payload) => async(dispatch, getState) => {
  console.debug("action:setImageUrl", payload)
  return dispatch(SET_IMAGE_URL(payload));
}
export const changeStudyTip = (payload) => async(dispatch, getState) => {
  console.debug("action:changeStudyTip", payload)
  return dispatch(CHANGE_STUDY_TIP(payload))
}
export const finishStudy = (payload) => async(dispatch, getState) => {
  const result = await request.get("/user/up_study");
  return dispatch(FINISH_STUDY({ data: result.data }));
}
