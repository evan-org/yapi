import React from "react";
import ReactDOM from "react-dom/client";
import reportWebVitals from "./reportWebVitals";
//
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./reducer/store";
//
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
import "./plugin";
// style
import "./styles/custom-ui/index.less";
//
import "./styles/antd-ui/index.less";
//
import "./styles/material-ui/index.scss";
import { ConfigProvider } from "antd";
import "babel-polyfill"
//
console.debug("11111111111", store, process.env);
//
const root = ReactDOM.createRoot(document.getElementById("yapi"));
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
