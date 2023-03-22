
import React from "react";
import ReactDOM from "react-dom";
import App from "./Application";
import { Provider } from "react-redux";
import createStore from "./reducer/create";
import { ConfigProvider } from "antd";
import "./plugin";
// style
import "./styles/custom-ui/index.less";
//
import "./styles/antd-ui/index.less";
//
import "./styles/material-ui/index.scss";
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
// import zhCN from "antd/lib/locale-provider/zh_CN";

const store = createStore();

ReactDOM.render(
  <Provider store={store}>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </Provider>,
  document.getElementById("yapi")
);
