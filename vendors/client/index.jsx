// import "./plugin";
import React from "react";
import { createRoot } from "react-dom/client";
// third party
import { Provider } from "react-redux";
// project imports
import reportWebVitals from "./reportWebVitals.js";
import * as serviceWorker from "./serviceWorker.js";
import App from "./App.jsx";
import store from "./reducer/store.js";
// style + assets
import "@/assets/styles/index.scss";
//
//
const root = createRoot(document.getElementById("yapi"));
root.render(
  <Provider store={store}>
    <App/>
  </Provider>
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
reportWebVitals();
