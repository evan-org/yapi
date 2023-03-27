import { ConfigProvider } from "antd";
import "./plugin";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./reducer/store";
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
import zhCN from "antd/lib/locale-provider/zh_CN";
//
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      light: "#1097E1",
      main: "#005BAC",
      dark: "#0045ac",
      contrastText: "#fff"
    },
    secondary: {
      light: "#f44336",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000"
    }
  }
});
//
const root = ReactDOM.createRoot(document.getElementById("yapi"));
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConfigProvider locale={zhCN}>
        <App/>
      </ConfigProvider>
    </ThemeProvider>
  </Provider>
);
