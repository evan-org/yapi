import { ConfigProvider } from "antd";
import { CssBaseline, ThemeProvider } from "@mui/material";
import "./plugin";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./reducer/store";
import muiTheme from "./theme/muiTheme";
import "./styles/tokens.css";
import "./styles/globals.css";
import "./styles/antd-overrides.css";
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from "antd/lib/locale-provider/zh_CN";

const root = ReactDOM.createRoot(document.getElementById("yapi"));

root.render(
  <Provider store={store}>
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <ConfigProvider locale={zhCN}>
        <App />
      </ConfigProvider>
    </ThemeProvider>
  </Provider>
);
