import { applyMiddleware, createStore as _createStore } from "redux";
import promiseMiddleware from "redux-promise";
import messageMiddleware from "./middleware/messageMiddleware";
import reducer from "./modules/reducer";

export default function createStore(initialState = {}) {
  const middleware = [promiseMiddleware, messageMiddleware];

  let finalCreateStore;
  // if (process.env.NODE_ENV === 'production') {
  finalCreateStore = applyMiddleware(...middleware)(_createStore);
  // } else {
  //   finalCreateStore = compose(
  //     applyMiddleware(...middleware),
  //     window.devToolsExtension ? window.devToolsExtension() : require('../pages/DevTools/DevTools').instrument()
  //   )(_createStore);
  // }

  return finalCreateStore(reducer, initialState);
}
