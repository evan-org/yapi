import { combineReducers } from "@reduxjs/toolkit";
import customizationReducer from "packages/yapi-client/store/modules/customizationReducer.js";
import user from "packages/yapi-client/store/modules/user.js";
import group from "packages/yapi-client/store/modules/group.js";
import project from "packages/yapi-client/store/modules/project.js";
import inter from "packages/yapi-client/store/modules/interface.js";
import interfaceCol from "packages/yapi-client/store/modules/interfaceCol.js";
import news from "packages/yapi-client/store/modules/news.js";
import addInterface from "packages/yapi-client/store/modules/addInterface.js";
import menu from "packages/yapi-client/store/modules/menu.js";
import follow from "packages/yapi-client/store/modules/follow.js";
import mockCol from "packages/yapi-client/store/modules/mockCol.js";
import { emitHook } from "@/plugin.js";
//

const reducerModules = {
  customization: customizationReducer,
  group,
  user,
  inter,
  interfaceCol,
  project,
  news,
  addInterface,
  menu,
  follow,
  mockCol
};
emitHook("add_reducer", reducerModules);
const createRootReducer = combineReducers({
  ...reducerModules
});
export default createRootReducer
