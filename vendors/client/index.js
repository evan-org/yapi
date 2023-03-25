import React from "react";
import reportWebVitals from "./reportWebVitals";
//
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./reducer/store";
// style
import "./styles/custom-ui/index.less";
//
import "./styles/antd-ui/index.less";
//
import "./styles/material-ui/index.scss";
//
// import CssBaseline from "@mui/material/CssBaseline";
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
import "./plugin";
import { ConfigProvider } from "antd";
//
// console.debug("11111111111", store, process.env);
import { createRoot } from "react-dom/client";
const container = document.getElementById("yapi");
// console.warn("111111111111111", container);
const root = createRoot(container);
//
root.render(
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <ConfigProvider>
        <App/>
      </ConfigProvider>
    </ThemeProvider>
  </Provider>
);
//
reportWebVitals();
