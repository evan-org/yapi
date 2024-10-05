import React from "react";
// project imports
import ThemeRoutes from "@/router/index.js";
import { BrowserRouter, RouterProvider } from "react-router-dom";
// antd
// 由于 antd 组件的默认文案是英文，所以需要修改为中文
// import dayjs from "dayjs";
// import "dayjs/locale/zh-cn";
// import { ConfigProvider } from "antd";
// import zhCN from "antd/es/locale/zh_CN";
// dayjs.locale("zh-cn");
//
//
// import MyPopConfirm from "./components/MyPopConfirm/MyPopConfirm";
/* const showConfirm = (msg, callback) => {
  // 自定义 window.confirm
  // http://reacttraining.cn/web/api/BrowserRouter/getUserConfirmation-func
  let container = document.createElement("div");
  document.body.appendChild(container);
  const root = ReactDOM.createRoot(container);
  root.render(<MyPopConfirm msg={msg} callback={callback}/>);
};*/
function App(props) {
  console.log(process.env);
  return (
    <BrowserRouter>
      <ThemeRoutes/>
    </BrowserRouter>
  )
}
export default App
