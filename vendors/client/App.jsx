import React from "react";
import { useSelector } from "react-redux";
import { useRoutes, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline, StyledEngineProvider } from "@mui/material";
// project imports
import NavigationScroll from "./layout/NavigationScroll";
import themes from "@/themes";
//
// import MyPopConfirm from "./components/MyPopConfirm/MyPopConfirm";
//
import ThemeRoutes, { routes } from "@/router/index.js";
//
import "./styles/App.scss";
import "./styles/antd-ui/theme.less";
//
import { AppRoute } from "@/router/oldIndex";
// antd
import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale-provider/zh_CN";
//
const plugin = require("client/plugin.js");
// 增加路由钩子
plugin.emitHook("app_route", AppRoute);
//
//   /* const showConfirm = (msg, callback) => {
//     // 自定义 window.confirm
//     // http://reacttraining.cn/web/api/BrowserRouter/getUserConfirmation-func
//     let container = document.createElement("div");
//     document.body.appendChild(container);
//     const root = ReactDOM.createRoot(container);
//     root.render(<MyPopConfirm msg={msg} callback={callback}/>);
//   };*/
function App(props) {
  const customization = useSelector((state) => state.customization);
  console.log(process.env);
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={themes(customization)}>
        <ConfigProvider locale={zhCN}>
          <CssBaseline/>
          <ThemeRoutes/>
        </ConfigProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  )
}
export default App
