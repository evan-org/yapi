import { applyMiddleware, legacy_createStore as _createStore } from "redux";
import promiseMiddleware from "redux-promise";
import messageMiddleware from "./middleware/messageMiddleware";
import reducer from "./modules/reducer";

export default function createStore(initialState = {}) {
  const middleware = [promiseMiddleware, messageMiddleware];
  let finalCreateStore;
  finalCreateStore = applyMiddleware(...middleware)(_createStore);
  return finalCreateStore(reducer, initialState);
}
