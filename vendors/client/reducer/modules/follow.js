import { fetchFollowList, addFollow as addFollowApi, removeFollow } from "../../api/follow";

const GET_FOLLOW_LIST = "yapi/follow/GET_FOLLOW_LIST";
const DEL_FOLLOW = "yapi/follow/DEL_FOLLOW";
const ADD_FOLLOW = "yapi/follow/ADD_FOLLOW";

const initialState = {
  data: []
};

export default (state = initialState, action) => {
  if (action.type === GET_FOLLOW_LIST) {
    return {
      ...state,
      data: action.payload.data.data
    };
  }
  return state;
};

export function getFollowList(uid) {
  return {
    type: GET_FOLLOW_LIST,
    payload: fetchFollowList(uid)
  };
}

export function addFollow(param) {
  return {
    type: ADD_FOLLOW,
    payload: addFollowApi(param)
  };
}

export function delFollow(id) {
  return {
    type: DEL_FOLLOW,
    payload: removeFollow(id)
  };
}
