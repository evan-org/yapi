import request from "@/service/request.js";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
// 封装 createAsyncThunk 函数
const createAsyncThunkWithStatus = (name, thunkFn) => {
  const typePrefix = `${name}/status`;
  const asyncThunk = createAsyncThunk(`${name}/async`, thunkFn);
  asyncThunk.typePrefix = typePrefix;
  return asyncThunk;
};
// 创建 fetchUserById 异步 action creator
export const groupList = createAsyncThunkWithStatus("group/groupList", async() => {
  const response = await request.get("/group/list");
  return response.data;
});
// 生成 extraReducers
const createAsyncReducers = (asyncThunks) => {
  const reducers = {};
  asyncThunks.forEach((asyncThunk) => {
    const [pending, fulfilled, rejected] = [
      asyncThunk.pending,
      asyncThunk.fulfilled,
      asyncThunk.rejected,
    ];
    reducers[pending] = (state) => {
      state[asyncThunk.typePrefix] = "loading";
    };
    reducers[fulfilled] = (state, action) => {
      state[asyncThunk.typePrefix] = "succeeded";
      // state[action.payload.id] = action.payload;
    };
    reducers[rejected] = (state, action) => {
      state[asyncThunk.typePrefix] = "failed";
      state.error = action.error.message;
    };
  });
  return reducers;
};
//
export const appSlice = createSlice({
  name: "group",
  initialState: {
    currentGroupId: "", // 当前选择的组ID
    groupList: [],
    myGroup: {},
    currGroup: {
      group_name: "",
      group_desc: "",
      custom_field1: {
        name: "",
        enable: false
      }
    },
    field: {
      name: "",
      enable: false
    },
    member: [],
    role: ""
  },
  reducers: {
    /* 设置当前选中的ID */
    SET_CURRENT_GROUP_ID: (state, action) => {
      console.debug("[FETCH_GROUP_LIST]: ", action);
      state.currentGroupId = action.payload;
    },
    /* 获取我的空间 */
    FETCH_MY_GROUP_LIST: (state, action) => {
      console.debug("[FETCH_GROUP_LIST]: ", action);
      state.myGroup = action.payload.data.data;
    },
    /* 获取当前组列表 */
    FETCH_GROUP_LIST: (state, action) => {
      console.debug("[FETCH_GROUP_LIST]: ", action);
      state.groupList = action.payload.data.data;
    },
    /* 更新组列表 */
    UPDATE_GROUP_LIST: (state, action) => {
      console.debug("[UPDATE_GROUP_LIST]: ", action);
      state.groupList = action.payload
    },
    /* 设置当前选中的组 */
    SET_CURR_GROUP: (state, action) => {
      console.debug("[SET_CURR_GROUP]: ", action);
      state.currGroup = { ...action.payload.data.data, id: action.payload.data.data._id };
      //
      state.currentGroupId = action.payload.data.data._id;
    },
    FETCH_GROUP_MEMBER: (state, action) => {
      console.debug("[FETCH_GROUP_MEMBER]: ", action);
      state.member = action.payload.data.data
    },
    FETCH_GROUP_MSG: (state, action) => {
      console.debug("[FETCH_GROUP_MSG]: ", action);
      state.role = action.payload.data.role;
      state.currGroup = action.payload.data;
      state.field = {
        name: action.payload.data.data.custom_field1.name,
        enable: action.payload.data.data.custom_field1.enable
      }
    }
  },
  // extraReducers: createAsyncReducers([groupList]),
})
// 每个 case reducer 函数会生成对应的 Action creators
export const {
  SET_CURRENT_GROUP_ID,
  FETCH_GROUP_LIST,
  UPDATE_GROUP_LIST,
  SET_CURR_GROUP,
  FETCH_GROUP_MEMBER,
  FETCH_GROUP_MSG,
  FETCH_MY_GROUP_LIST,
  ADD_GROUP_MEMBER,
  DEL_GROUP_MEMBER,
  CHANGE_GROUP_MEMBER,
  CHANGE_GROUP_MESSAGE,
  DEL_GROUP
} = appSlice.actions
//
export default appSlice.reducer
// 获取 group 信息 (权限信息)
export async function fetchGroupMsg(id) {
  const result = await request.get("/group/get", { params: { id } })
  return {
    type: FETCH_GROUP_MSG,
    payload: result
  };
}
// 添加分组成员
export async function addMember(param) {
  const result = await request.post("/group/add_member", param)
  return {
    type: ADD_GROUP_MEMBER,
    payload: result
  };
}
// 删除分组成员
export async function delMember(param) {
  const result = await request.post("/group/del_member", param)
  return {
    type: DEL_GROUP_MEMBER,
    payload: result
  };
}
// 修改分组成员权限
export async function changeMemberRole(param) {
  const result = await request.post("/group/change_member_role", param)
  return {
    type: CHANGE_GROUP_MEMBER,
    payload: result
  };
}
// 修改分组信息
export async function changeGroupMsg(param) {
  const result = await request.post("/group/up", param)
  return {
    type: CHANGE_GROUP_MESSAGE,
    payload: result
  };
}
// 更新左侧的分组列表
export function updateGroupList(param) {
  return {
    type: UPDATE_GROUP_LIST,
    payload: param
  };
}
// 删除分组
export async function deleteGroup(param) {
  const result = await request.post("/group/del", param)
  return {
    type: DEL_GROUP,
    payload: result
  };
}
// 获取分组成员列表
export async function fetchGroupMemberList(id) {
  const result = await request.get("/group/get_member_list", { params: { id } })
  return {
    type: FETCH_GROUP_MEMBER,
    payload: result
  };
}
// Action Creators
export async function fetchGroupList() {
  const result = await request.get("/group/list")
  return {
    type: FETCH_GROUP_LIST,
    payload: result
  };
}
// Action Creators
export async function fetchMyGroup() {
  const result = await request.get("/group/get_mygroup");
  return {
    type: FETCH_MY_GROUP_LIST,
    payload: result
  };
}
//
export async function setCurrGroup(group, time) {
  if (group && group._id) {
    const result = await request.get("/group/get", { id: group._id })
    return {
      type: SET_CURR_GROUP,
      payload: result
    };
  }
  // console.log("setCurrGroup ==========>", time);
}
