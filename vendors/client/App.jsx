import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { useRoutes, RouterProvider } from "react-router-dom";
//
// import MyPopConfirm from "./components/MyPopConfirm/MyPopConfirm";
//
import { routes } from "@/router/index.js";
// const router = createBrowserRouter(routes);
// let element = useRoutes(routes);
//
import "./styles/App.scss";
import "./styles/antd-ui/theme.less";
//
import { AppRoute } from "@/router/oldIndex";
//
const plugin = require("client/plugin.js");
// 增加路由钩子
plugin.emitHook("app_route", AppRoute);
//
function App(props) {
  console.log(process.env);
  //
  useEffect(() => {
  }, []);
  //
  /* const showConfirm = (msg, callback) => {
    // 自定义 window.confirm
    // http://reacttraining.cn/web/api/BrowserRouter/getUserConfirmation-func
    let container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(<MyPopConfirm msg={msg} callback={callback}/>);
  };*/
  //
  return (
    <div>
      <RouterProvider router={routes}/>
    </div>
  )
}
export default App
