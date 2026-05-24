import { fetchLogList, fetchLogListByUpdate } from "../../api/log";
import { fetchProject } from "../../api/project";
import variable from "../../utils/variable";

const FETCH_NEWS_DATA = "yapi/news/FETCH_NEWS_DATA";
const FETCH_MORE_NEWS = "yapi/news/FETCH_MORE_NEWS";

const initialState = {
  newsData: {
    list: [],
    total: 0
  },
  curpage: 1
};

export default (state = initialState, action) => {
  switch (action.type) {
    case FETCH_NEWS_DATA: {
      const list = action.payload.data.data.list;
      state.newsData.list = list;
      state.curpage = 1;
      state.newsData.list.sort(function(a, b) {
        return b.add_time - a.add_time;
      });
      return {
        ...state,
        newsData: {
          total: action.payload.data.data.total,
          list: state.newsData.list
        }
      };
    }
    case FETCH_MORE_NEWS: {
      const list = action.payload.data.data.list;
      state.newsData.list.push(...list);
      state.newsData.list.sort(function(a, b) {
        return b.add_time - a.add_time;
      });
      if (list && list.length) {
        state.curpage++;
      }
      return {
        ...state,
        newsData: {
          total: action.payload.data.data.total,
          list: state.newsData.list
        }
      };
    }
    default:
      return state;
  }
};

export function fetchNewsData(typeid, type, page, limit, selectValue) {
  const param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  };

  return {
    type: FETCH_NEWS_DATA,
    payload: fetchLogList(param)
  };
}

export function fetchMoreNews(typeid, type, page, limit, selectValue) {
  const param = {
    typeid: typeid,
    type: type,
    page: page,
    limit: limit ? limit : variable.PAGE_LIMIT,
    selectValue
  };
  return {
    type: FETCH_MORE_NEWS,
    payload: fetchLogList(param)
  };
}

export function getMockUrl(project_id) {
  return {
    type: "",
    payload: fetchProject(project_id)
  };
}

export function fetchUpdateLogData(params) {
  return {
    type: "",
    payload: fetchLogListByUpdate(params)
  };
}
