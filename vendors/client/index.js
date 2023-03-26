import { ConfigProvider } from "antd";
import "./plugin";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { Provider } from "react-redux";
import createStore from "./reducer/create";
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from "antd/lib/locale-provider/zh_CN";

const store = createStore();
const root = ReactDOM.createRoot(document.getElementById("yapi"));

root.render(
  <Provider store={store}>
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </Provider>
);
