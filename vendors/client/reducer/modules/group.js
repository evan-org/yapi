import {
  fetchGroup,
  fetchGroupList as fetchGroupListApi,
  addGroupMember,
  removeGroupMember,
  changeGroupMemberRole,
  updateGroup,
  deleteGroup as deleteGroupApi,
  fetchGroupMemberList as fetchGroupMemberListApi
} from "../../api/group";
// Actions
const FETCH_GROUP_LIST = "yapi/group/FETCH_GROUP_LIST";
const SET_CURR_GROUP = "yapi/group/SET_CURR_GROUP";
const FETCH_GROUP_MEMBER = "yapi/group/FETCH_GROUP_MEMBER";
const FETCH_GROUP_MSG = "yapi/group/FETCH_GROUP_MSG";
const ADD_GROUP_MEMBER = "yapi/group/ADD_GROUP_MEMBER";
const DEL_GROUP_MEMBER = "yapi/group/DEL_GROUP_MEMBER";
const CHANGE_GROUP_MEMBER = "yapi/group/CHANGE_GROUP_MEMBER";
const CHANGE_GROUP_MESSAGE = "yapi/group/CHANGE_GROUP_MESSAGE";
const UPDATE_GROUP_LIST = "yapi/group/UPDATE_GROUP_LIST";
const DEL_GROUP = "yapi/group/DEL_GROUP";
// Reducer
const initialState = {
  groupList: [],
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
};
export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_GROUP_LIST: {
      return {
        ...state,
        groupList: action.payload.data.data
      };
    }
    case UPDATE_GROUP_LIST: {
      return {
        ...state,
        groupList: action.payload
      };
    }
    case SET_CURR_GROUP: {
      console.log("SET_CURR_GROUP = action.payload : ", action.payload);
      return {
        ...state,
        currGroup: { ...action.payload.data.data, id: action.payload.data.data._id }
      };
    }
    case FETCH_GROUP_MEMBER: {
      return {
        ...state,
        member: action.payload.data.data
      };
    }
    case FETCH_GROUP_MSG: {
      console.log(action.payload)
      return {
        ...state,
        role: action.payload.data.data.role,
        currGroup: action.payload.data.data,
        field: {
          name: action.payload.data.data.custom_field1.name,
          enable: action.payload.data.data.custom_field1.enable
        }
      };
    }
    default:
      return state;
  }
};
export function fetchGroupMsg(id) {
  return {
    type: FETCH_GROUP_MSG,
    payload: fetchGroup(id)
  };
}
export function addMember(param) {
  return {
    type: ADD_GROUP_MEMBER,
    payload: addGroupMember(param)
  };
}
export function delMember(param) {
  return {
    type: DEL_GROUP_MEMBER,
    payload: removeGroupMember(param)
  };
}
export function changeMemberRole(param) {
  return {
    type: CHANGE_GROUP_MEMBER,
    payload: changeGroupMemberRole(param)
  };
}
export function changeGroupMsg(param) {
  return {
    type: CHANGE_GROUP_MESSAGE,
    payload: updateGroup(param)
  };
}
export function updateGroupList(param) {
  return {
    type: UPDATE_GROUP_LIST,
    payload: param
  };
}
export function deleteGroup(param) {
  return {
    type: DEL_GROUP,
    payload: deleteGroupApi(param)
  };
}
export function fetchGroupMemberList(id) {
  return {
    type: FETCH_GROUP_MEMBER,
    payload: fetchGroupMemberListApi({ id })
  };
}
export function fetchGroupList() {
  return {
    type: FETCH_GROUP_LIST,
    payload: fetchGroupListApi()
  };
}
export function setCurrGroup(group, time) {
  if (group && group._id) {
    return {
      type: SET_CURR_GROUP,
      payload: fetchGroup(group._id)
    };
  }
}
