import * as React from "react";
import { createRoot } from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
import CssBaseline from "@mui/material/CssBaseline";
import { createTheme, ThemeProvider } from "@mui/material/styles";
//
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
import App from "./App.jsx";
import { Provider } from "react-redux";
import createStore from "./reducer/create";
// 状态管理器
const store = createStore();
//
import "./plugin";
// style
import "./styles/custom-ui/index.less";
//
import "./styles/antd-ui/index.less";
//
import "./styles/material-ui/index.scss";
import { ConfigProvider } from "antd";
//
const rootElement = document.getElementById("yapi");
const root = createRoot(rootElement);
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
      <CssBaseline/>
      <ConfigProvider>
        <App/>
      </ConfigProvider>
    </ThemeProvider>
  </Provider>
);
//
reportWebVitals(console.log);
