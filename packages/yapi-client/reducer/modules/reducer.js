import { combineReducers } from "@reduxjs/toolkit";
import customizationReducer from "packages/yapi-client/reducer/modules/customizationReducer.js";
import user from "packages/yapi-client/reducer/modules/user.js";
import group from "packages/yapi-client/reducer/modules/group.js";
import project from "packages/yapi-client/reducer/modules/project.js";
import inter from "packages/yapi-client/reducer/modules/interface.js";
import interfaceCol from "packages/yapi-client/reducer/modules/interfaceCol.js";
import news from "packages/yapi-client/reducer/modules/news.js";
import addInterface from "packages/yapi-client/reducer/modules/addInterface.js";
import menu from "packages/yapi-client/reducer/modules/menu.js";
import follow from "packages/yapi-client/reducer/modules/follow.js";
import mockCol from "packages/yapi-client/reducer/modules/mockCol.js";
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
