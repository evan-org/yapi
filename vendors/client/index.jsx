import { ConfigProvider } from "antd";
import "./plugin";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./reducer/store";
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from "antd/lib/locale-provider/zh_CN";
import { BrowserRouter } from "react-router-dom";
import config from "@/config";
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
