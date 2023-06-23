import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import variable from "@/utils/variable.js";
import { htmlFilter } from "@/utils/common.js";
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
export const appSlice = createSlice({
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
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
const {
  GET_SWAGGER_URL_DATA,
  GET_CURR_PROJECT,
  FETCH_PROJECT_LIST,
  PROJECT_ADD,
  PROJECT_UPDATE,
  PROJECT_UPDATE_ENV,
  PROJECT_UPSET,
  GET_TOKEN,
  PROJECT_DEL,
  PROJECT_GET_ENV,
  CHECK_PROJECT_NAME,
  COPY_PROJECT_MSG,
  UPDATE_TOKEN,
  ADD_PROJECT_MEMBER,
  DEL_PROJECT_MEMBER,
  CHANGE_PROJECT_MEMBER,
  CHANGE_MEMBER_EMAIL_NOTICE,
  GET_PEOJECT_MEMBER
} = appSlice.actions;
export default appSlice.reducer
// 获取某分组下的项目列表
export async function fetchProjectList(id, pageNum) {
  return {
    type: FETCH_PROJECT_LIST,
    payload: await axios.get("/api/project/list", {
      params: {
        group_id: id,
        page: pageNum || 1,
        limit: variable.PAGE_LIMIT
      }
    })
  };
}
// 复制项目
export async function copyProjectMsg(params) {
  return {
    type: COPY_PROJECT_MSG,
    payload: await axios.post("/api/project/copy", params)
  };
}
// 添加项目成员
export async function addMember(param) {
  return {
    type: ADD_PROJECT_MEMBER,
    payload: await axios.post("/api/project/add_member", param)
  };
}
// 删除项目成员
export async function delMember(param) {
  return {
    type: DEL_PROJECT_MEMBER,
    payload: await axios.post("/api/project/del_member", param)
  };
}
// 修改项目成员权限
export async function changeMemberRole(param) {
  return {
    type: CHANGE_PROJECT_MEMBER,
    payload: await axios.post("/api/project/change_member_role", param)
  };
}
// 修改项目成员是否收到消息通知
export async function changeMemberEmailNotice(param) {
  return {
    type: CHANGE_MEMBER_EMAIL_NOTICE,
    payload: await axios.post("/api/project/change_member_email_notice", param)
  };
}
// 获取项目成员列表
export async function getProjectMemberList(id) {
  return {
    type: GET_PEOJECT_MEMBER,
    payload: await axios.get("/api/project/get_member_list", {
      params: { id }
    })
  };
}
// export function changeTableLoading(data) {
//   return {
//     type: CHANGE_TABLE_LOADING,
//     payload: data
//   };
// }
export async function addProject(data) {
  let {
    name,
    prd_host,
    basepath,
    desc,
    group_id,
    group_name,
    protocol,
    icon,
    color,
    project_type
  } = data;
  // 过滤项目名称中有html标签存在的情况
  name = htmlFilter(name);
  const param = {
    name,
    prd_host,
    protocol,
    basepath,
    desc,
    group_id,
    group_name,
    icon,
    color,
    project_type
  };
  return {
    type: PROJECT_ADD,
    payload: await axios.post("/api/project/add", param)
  };
}
// 修改项目
export async function updateProject(data) {
  let { name, project_type, basepath, desc, _id, env, group_id, switch_notice, strice, is_json5, tag } = data;
  // 过滤项目名称中有html标签存在的情况
  name = htmlFilter(name);
  const param = {
    name,
    project_type,
    basepath,
    switch_notice,
    desc,
    id: _id,
    env,
    group_id,
    strice,
    is_json5,
    tag
  };
  return {
    type: PROJECT_UPDATE,
    payload: await axios.post("/api/project/up", param)
  };
}
// 修改项目脚本
export async function updateProjectScript(data) {
  return {
    type: PROJECT_UPDATE,
    payload: await axios.post("/api/project/up", data)
  };
}
// 修改全局mock
export async function updateProjectMock(data) {
  return {
    type: PROJECT_UPDATE,
    payload: await axios.post("/api/project/up", data)
  };
}
// 修改项目环境配置
export async function updateEnv(data) {
  const { env, _id } = data;
  const param = {
    id: _id,
    env
  };
  return {
    type: PROJECT_UPDATE_ENV,
    payload: await axios.post("/api/project/up_env", param)
  };
}
// 获取项目环境配置
export async function getEnv(project_id) {
  return {
    type: PROJECT_GET_ENV,
    payload: await axios.get("/api/project/get_env", { params: { project_id } })
  };
}
// 修改项目头像
export async function upsetProject(param) {
  return {
    type: PROJECT_UPSET,
    payload: await axios.post("/api/project/upset", param)
  };
}
// 删除项目
export async function delProject(id) {
  const param = { id };
  return {
    type: PROJECT_DEL,
    payload: await axios.post("/api/project/del", param)
  };
}
export async function getProject(id) {
  return {
    type: GET_CURR_PROJECT,
    payload: await axios.get("/api/project/get?id=" + id)
  };
}
export async function getToken(project_id) {
  return {
    type: GET_TOKEN,
    payload: await axios.get("/api/project/token", {
      params: { project_id }
    })
  };
}
export async function updateToken(project_id) {
  return {
    type: UPDATE_TOKEN,
    payload: await axios.get("/api/project/update_token", {
      params: { project_id }
    })
  };
}
export async function checkProjectName(name, group_id) {
  return {
    type: CHECK_PROJECT_NAME,
    payload: await axios.get("/api/project/check_project_name", {
      params: { name, group_id }
    })
  };
}
export async function handleSwaggerUrlData(url) {
  return {
    type: GET_SWAGGER_URL_DATA,
    payload: await axios.get("/api/project/swagger_url?url=" + encodeURI(encodeURI(url)))
  };
}
