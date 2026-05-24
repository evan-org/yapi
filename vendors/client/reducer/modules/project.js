import {
  fetchProjectList as fetchProjectListApi,
  copyProject as copyProjectApi,
  addProjectMember,
  removeProjectMember,
  changeProjectMemberRole,
  changeProjectMemberEmailNotice,
  fetchProjectMemberList,
  addProject as addProjectApi,
  updateProject as updateProjectApi,
  updateProjectEnv,
  fetchProjectEnv,
  upsetProject as upsetProjectApi,
  deleteProject as deleteProjectApi,
  fetchProject as fetchProjectApi,
  fetchProjectToken,
  updateProjectToken,
  checkProjectName as checkProjectNameApi,
  fetchSwaggerUrl
} from "../../api/project";
import variable from "../../utils/variable";
import {htmlFilter} from "../../utils/common";

// Actions
const FETCH_PROJECT_LIST = "yapi/project/FETCH_PROJECT_LIST";
const PROJECT_ADD = "yapi/project/PROJECT_ADD";
const PROJECT_DEL = "yapi/project/PROJECT_DEL";
// const CHANGE_TABLE_LOADING = 'yapi/project/CHANGE_TABLE_LOADING';
const PROJECT_UPDATE = "yapi/project/PROJECT_UPDATE";
const PROJECT_UPDATE_ENV = "yapi/project/PROJECT_UPDATE_ENV";
const PROJECT_UPSET = "yapi/project/PROJECT_UPSET";
const GET_CURR_PROJECT = "yapi/project/GET_CURR_PROJECT";
const GET_PEOJECT_MEMBER = "yapi/project/GET_PEOJECT_MEMBER";
const ADD_PROJECT_MEMBER = "yapi/project/ADD_PROJECT_MEMBER";
const DEL_PROJECT_MEMBER = "yapi/project/DEL_PROJECT_MEMBER";
const CHANGE_PROJECT_MEMBER = "yapi/project/CHANGE_PROJECT_MEMBER";
const GET_TOKEN = "yapi/project/GET_TOKEN";
const UPDATE_TOKEN = "yapi/project/UPDATE_TOKEN";
const CHECK_PROJECT_NAME = "yapi/project/CHECK_PROJECT_NAME";
const COPY_PROJECT_MSG = "yapi/project/COPY_PROJECT_MSG";
const PROJECT_GET_ENV = "yapi/project/PROJECT_GET_ENV";
const CHANGE_MEMBER_EMAIL_NOTICE = "yapi/project/CHANGE_MEMBER_EMAIL_NOTICE";
const GET_SWAGGER_URL_DATA = "yapi/project/GET_SWAGGER_URL_DATA"
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

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CURR_PROJECT: {
      return {
        ...state,
        currProject: action.payload.data.data
      };
    }

    case FETCH_PROJECT_LIST: {
      return {
        ...state,
        projectList: action.payload.data.data.list,
        total: action.payload.data.data.total,
        userInfo: action.payload.data.data.userinfo
      };
    }

    case PROJECT_ADD: {
      return state;
    }
    case PROJECT_DEL: {
      return state;
    }

    case GET_TOKEN: {
      return {
        ...state,
        token: action.payload.data.data
      };
    }

    case PROJECT_GET_ENV: {
      return {
        ...state,
        projectEnv: action.payload.data.data
      };
    }
    case UPDATE_TOKEN: {
      return {
        ...state,
        token: action.payload.data.data.token
      };
    }

    case CHECK_PROJECT_NAME: {
      return {
        ...state
      };
    }
    case COPY_PROJECT_MSG: {
      return {
        ...state
      };
    }

    case GET_SWAGGER_URL_DATA: {
      return {
        ...state,
        swaggerUrlData: action.payload.data.data
      }
    }
    default:
      return state;
  }
};

// 获取某分组下的项目列表
export function fetchProjectList(id, pageNum) {
  return {
    type: FETCH_PROJECT_LIST,
    payload: fetchProjectListApi({
      group_id: id,
      page: pageNum || 1,
      limit: variable.PAGE_LIMIT
    })
  };
}

// 复制项目
export function copyProjectMsg(params) {
  return {
    type: COPY_PROJECT_MSG,
    payload: copyProjectApi(params)
  };
}

// 添加项目成员
export function addMember(param) {
  return {
    type: ADD_PROJECT_MEMBER,
    payload: addProjectMember(param)
  };
}

// 删除项目成员
export function delMember(param) {
  return {
    type: DEL_PROJECT_MEMBER,
    payload: removeProjectMember(param)
  };
}

// 修改项目成员权限
export function changeMemberRole(param) {
  return {
    type: CHANGE_PROJECT_MEMBER,
    payload: changeProjectMemberRole(param)
  };
}
// 修改项目成员是否收到消息通知
export function changeMemberEmailNotice(param) {
  return {
    type: CHANGE_MEMBER_EMAIL_NOTICE,
    payload: changeProjectMemberEmailNotice(param)
  };
}

// 获取项目成员列表
export function getProjectMemberList(id) {
  return {
    type: GET_PEOJECT_MEMBER,
    payload: fetchProjectMemberList(id)
  };
}

// export function changeTableLoading(data) {
//   return {
//     type: CHANGE_TABLE_LOADING,
//     payload: data
//   };
// }

export function addProject(data) {
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
    payload: addProjectApi(param)
  };
}

// 修改项目
export function updateProject(data) {
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
    payload: updateProjectApi(param)
  };
}

// 修改项目脚本
export function updateProjectScript(data) {
  return {
    type: PROJECT_UPDATE,
    payload: updateProjectApi(data)
  };
}

// 修改全局mock
export function updateProjectMock(data) {
  return {
    type: PROJECT_UPDATE,
    payload: updateProjectApi(data)
  };
}

// 修改项目环境配置
export function updateEnv(data) {
  const { env, _id } = data;
  const param = {
    id: _id,
    env
  };
  return {
    type: PROJECT_UPDATE_ENV,
    payload: updateProjectEnv(param)
  };
}

// 获取项目环境配置
export function getEnv(project_id) {
  return {
    type: PROJECT_GET_ENV,
    payload: fetchProjectEnv(project_id)
  };
}

// 修改项目头像
export function upsetProject(param) {
  return {
    type: PROJECT_UPSET,
    payload: upsetProjectApi(param)
  };
}

// 删除项目
export function delProject(id) {
  const param = { id };
  return {
    type: PROJECT_DEL,
    payload: deleteProjectApi(param)
  };
}

export async function getProject(id) {
  let result = await fetchProject(id);
  return {
    type: GET_CURR_PROJECT,
    payload: result
  };
}

export async function getToken(project_id) {
  return {
    type: GET_TOKEN,
    payload: fetchProjectToken(project_id)
  };
}

export async function updateToken(project_id) {
  return {
    type: UPDATE_TOKEN,
    payload: updateProjectToken(project_id)
  };
}

export async function checkProjectName(name, group_id) {
  return {
    type: CHECK_PROJECT_NAME,
    payload: checkProjectNameApi(name, group_id)
  };
}

export async function handleSwaggerUrlData(url) {
  return {
    type: GET_SWAGGER_URL_DATA,
    payload: fetchSwaggerUrl(url)
  };
}
