import { createSlice } from "@reduxjs/toolkit";
import request from "@/service/request.js";
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
    LOGIN: (state, action) => {
      if (action.payload.data.errcode === 0) {
        state.isLogin = true;
        state.loginState = MEMBER_STATUS;
        state.uid = action.payload.data.data.uid;
        state.userName = action.payload.data.data.username;
        state.role = action.payload.data.data.role;
        state.type = action.payload.data.data.type;
        state.study = action.payload.data.data.study;
      }
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
      state.loginWrapActiveKey = action.index;
    },
    REGISTER: (state, action) => {
      state.isLogin = true;
      state.loginState = MEMBER_STATUS;
      state.uid = action.payload.data.data.uid;
      state.userName = action.payload.data.data.username;
      state.type = action.payload.data.data.type;
      state.study = action.payload.data.data ? action.payload.data.data.study : false;
    },
    SET_BREADCRUMB: (state, action) => {
      state.breadcrumb = action.data;
    },
    CHANGE_STUDY_TIP: (state, action) => {
      state.studyTip = state.studyTip + 1
    },
    FINISH_STUDY: (state, action) => {
      state.study = true;
      state.studyTip = 0;
    },
    SET_IMAGE_URL: (state, action) => {
      state.imageUrl = action.data;
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
export default appSlice.reducer
// Action Creators
export async function checkLoginState() {
  const result = await request.get("/user/status")
  return {
    type: GET_LOGIN_STATE,
    payload: result
  };
}
export async function loginActions(data) {
  const result = await request.post("/user/login", data)
  return {
    type: LOGIN,
    payload: result
  };
}
export async function loginLdapActions(data) {
  const result = await request.post("/user/login_by_ldap", data)
  return {
    type: LOGIN,
    payload: result
  };
}
export async function regActions(data) {
  const { email, password, userName } = data;
  const param = {
    email,
    password,
    username: userName
  };
  const result = await request.post("/user/reg", param)
  return {
    type: REGISTER,
    payload: result
  };
}
export async function logoutActions() {
  const result = await request.get("/user/logout")
  return {
    type: LOGIN_OUT,
    payload: result
  };
}
export async function loginTypeAction(index) {
  return {
    type: LOGIN_TYPE,
    index: index
  };
}
export function setBreadcrumb(data) {
  return {
    type: SET_BREADCRUMB,
    data: data
  };
}
export function setImageUrl(data) {
  return {
    type: SET_IMAGE_URL,
    data: data
  };
}
export function changeStudyTip() {
  return {
    type: CHANGE_STUDY_TIP
  };
}
export async function finishStudy() {
  return {
    type: FINISH_STUDY,
    payload: await request.get("/user/up_study")
  };
}
