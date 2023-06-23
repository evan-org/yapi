import { combineReducers } from "@reduxjs/toolkit";

import customizationReducer from "./customizationReducer.js";
import user from "./user.js";
import group from "./group.js";
import project from "./project.js";
import inter from "./interface.js";
import interfaceCol from "./interfaceCol.js";
import news from "./news.js";
import addInterface from "./addInterface.js";
import menu from "./menu.js";
import follow from "./follow.js";
import mockCol from "./mockCol.js";

import { emitHook } from "client/plugin.js";

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

export default combineReducers(reducerModules);
