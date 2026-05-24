import { fetchAdvMockCaseList } from "../../api/plugin";

// Actions
const FETCH_MOCK_COL = "yapi/mockCol/FETCH_MOCK_COL";

// Reducer
const initialState = {
  list: []
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_MOCK_COL:
      return {
        ...state,
        list: action.payload.data
      };
    default:
      return state;
  }
};

/**
 * 获取高级 Mock 用例列表（插件 advmock）
 */
export async function fetchMockCol(interfaceId) {
  const result = await fetchAdvMockCaseList(interfaceId);
  return {
    type: FETCH_MOCK_COL,
    payload: result.data
  };
}
