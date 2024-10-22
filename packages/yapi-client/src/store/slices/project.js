"use client"
import { createSlice } from "@reduxjs/toolkit";
import request from "@/shared/request.js";
import { PAGE_LIMIT } from "@/shared/config.js";
import { htmlFilter } from "@/utils/common.mjs";
// Reducer
const initialState = {
  isUpdateModalShow: false,
  handleUpdateIndex: -1,
  projectList: [],
  projectMsg: {},
  userInfo: {},
  tableLoading: true,
  total: 0,
  currPage: 1,
  token: "",
  currProject: {},
  projectEnv: {
    env: [
      {
        header: []
      }
    ]
  },
  swaggerUrlData: ""
};
//
export const projectSlice = createSlice({
  name: "project",
  initialState: initialState,
  reducers: {
    GET_CURR_PROJECT: (state, action) => {
      state.currProject = action.payload.data.data;
    },
    FETCH_PROJECT_LIST: (state, action) => {
      state.projectList = action.payload.data.data.list;
      state.total = action.payload.data.data.total;
      state.userInfo = action.payload.data.data.userinfo;
    },
    PROJECT_ADD: (state, action) => {
      // state.data = action.payload.data.data;
    },
    PROJECT_DEL: (state, action) => {
      // state.data = action.payload.data.data;
    },
    GET_TOKEN: (state, action) => {
      state.token = action.payload.data.data;
    },
    PROJECT_GET_ENV: (state, action) => {
      state.projectEnv = action.payload.data.data;
    },
    UPDATE_TOKEN: (state, action) => {
      state.token = action.payload.data.data.token;
    },
    //
    CHECK_PROJECT_NAME: (state, action) => {
      // state.token = action.payload.data.data.token;
    },
    COPY_PROJECT_MSG: (state, action) => {
      // state.token = action.payload.data.data.token;
    },
    //
    GET_SWAGGER_URL_DATA: (state, action) => {
      state.swaggerUrlData = action.payload.data.data;
    },
    //
    CHANGE_TABLE_LOADING: (state, action) => {
      // state.swaggerUrlData = action.payload.data.data;
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  GET_SWAGGER_URL_DATA,
  GET_CURR_PROJECT,
  FETCH_PROJECT_LIST,
  PROJECT_ADD,
  GET_TOKEN,
  PROJECT_DEL,
  PROJECT_GET_ENV,
  CHECK_PROJECT_NAME,
  COPY_PROJECT_MSG,
  UPDATE_TOKEN,
  CHANGE_TABLE_LOADING,
  //
  ADD_PROJECT_MEMBER,
  DEL_PROJECT_MEMBER,
  CHANGE_PROJECT_MEMBER,
  CHANGE_MEMBER_EMAIL_NOTICE,
  GET_PROJECT_MEMBER,
  PROJECT_UPDATE,
  PROJECT_UPDATE_ENV,
  PROJECT_UPSET
  //
} = projectSlice.actions;


// 获取某分组下的项目列表
export const fetchProjectList = (id, pageNum) => async(dispatch, getState) => {
  const result = await request.get("/project/list", {
    group_id: id,
    page: pageNum || 1,
    limit: PAGE_LIMIT
  })
  return dispatch(FETCH_PROJECT_LIST({ data: result.data }));
}
// 复制项目
export const copyProjectMsg = (data) => async(dispatch, getState) => {
  const result = await request.post("/project/copy", data, data);
  return dispatch(COPY_PROJECT_MSG({ data: result.data }));
}
// 添加项目成员
export const addMember = (param) => async(dispatch, getState) => {
  const result = await request.post("/project/add_member", param);
  return dispatch(ADD_PROJECT_MEMBER({ data: result.data }));
}
// 删除项目成员
export const delMember = (param) => async(dispatch, getState) => {
  const result = await request.post("/project/del_member", param);
  return dispatch(DEL_PROJECT_MEMBER({ data: result.data }));
}
// 修改项目成员权限
export const changeMemberRole = (param) => async(dispatch, getState) => {
  const result = await request.post("/project/change_member_role", param);
  return dispatch(CHANGE_PROJECT_MEMBER({ data: result.data }));
}
// 修改项目成员是否收到消息通知
export const changeMemberEmailNotice = (param) => async(dispatch, getState) => {
  const result = await request.post("/project/change_member_email_notice", param);
  return dispatch(CHANGE_MEMBER_EMAIL_NOTICE({ data: result.data }));
}
// 获取项目成员列表
export const getProjectMemberList = (id) => async(dispatch, getState) => {
  const result = await request.get("/project/get_member_list", { id });
  return dispatch(GET_PROJECT_MEMBER({ data: result.data }));
}
//
export const changeTableLoading = (data) => async(dispatch) => {
  console.debug("action:changeTableLoading", data);
  dispatch(CHANGE_TABLE_LOADING(data));
}
export const addProject = (data) => async(dispatch, getState) => {
  // name 过滤项目名称中有html标签存在的情况
  const result = await request.post("/project/add", { ...data, name: htmlFilter(data.name) })
  return dispatch(PROJECT_ADD({ data: result.data }))
}
// 修改项目
export const updateProject = (data) => async(dispatch, getState) => {
  // 过滤项目名称中有html标签存在的情况
  const result = await request.post("/project/up", { ...data, id: data._id, name: htmlFilter(data.name) });
  return dispatch(PROJECT_UPDATE({ data: result.data }));
}
// 修改项目脚本
export const updateProjectScript = (data) => async(dispatch, getState) => {
  const result = await request.post("/project/up", data);
  return dispatch(PROJECT_UPDATE({ data: result.data }));
}
// 修改全局mock
export const updateProjectMock = (data) => async(dispatch, getState) => {
  const result = await request.post("/project/up", data);
  return dispatch(PROJECT_UPDATE({ data: result.data }));
}
// 修改项目环境配置
export const updateEnv = (data) => async(dispatch, getState) => {
  const { env, _id } = data;
  const result = await request.post("/project/up_env", { id: _id, env });
  return dispatch(PROJECT_UPDATE_ENV({ data: result.data }));
}
// 获取项目环境配置
export const getEnv = (project_id) => async(dispatch, getState) => {
  const result = await request.get("/project/get_env", { project_id });
  return dispatch(PROJECT_GET_ENV({ data: result.data }));
}
// 修改项目头像
export const upsetProject = (param) => async(dispatch, getState) => {
  const result = await request.post("/project/upset", param);
  return dispatch(PROJECT_UPSET({ data: result.data }));
}
// 删除项目
export const delProject = (id) => async(dispatch, getState) => {
  const result = await request.post("/project/del", { id });
  return dispatch(PROJECT_DEL({ data: result.data }));
}
// 根据ID查看项目
export const getProject = (id) => async(dispatch, getState) => {
  const result = await request.get("/project/get", { id: id })
  return dispatch(GET_CURR_PROJECT({ data: result.data }));
}
//
export const getToken = (project_id) => async(dispatch, getState) => {
  const result = await request.get("/project/token", { project_id });
  return dispatch(GET_TOKEN({ data: result.data }));
}
// 更新token
export const updateToken = (project_id) => async(dispatch, getState) => {
  const result = await request.get("/project/update_token", { project_id });
  return dispatch(UPDATE_TOKEN({ data: result.data }));
}
export const checkProjectName = (name, group_id) => async(dispatch, getState) => {
  const result = await request.get("/project/check_project_name", { name, group_id })
  return dispatch(CHECK_PROJECT_NAME({ data: result.data }));
}
export const handleSwaggerUrlData = (url) => async(dispatch, getState) => {
  const result = await request.get("/project/swagger_url?url=" + encodeURI(encodeURI(url)));
  return dispatch(GET_SWAGGER_URL_DATA({ data: result.data }));
}
