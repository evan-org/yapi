import "./plugin";
import React from "react";
import ReactDOM from "react-dom/client";

// third party
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";

// project imports
import * as serviceWorker from "./serviceWorker.js";
import App from "./App.jsx";
import store from "./reducer/store.js";

// style + assets
import "@/assets/styles/index.scss";
import config from "@/config.js";
//
//
const root = ReactDOM.createRoot(document.getElementById("yapi"));
root.render(
  <Provider store={store}>
    <BrowserRouter basename={config.basename}>
      <App />
    </BrowserRouter>
  </Provider>
);
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
