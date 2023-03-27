import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { connect } from "react-redux";
import { Route, BrowserRouter as Router } from "react-router-dom";
//
import Layout from "./layout/Layout";
import { AppRoute } from "client/router";
// const RouterList = Object.keys(AppRoute);
import { requireAuthentication } from "./components/AuthenticatedComponent";
//
import MyPopConfirm from "./components/MyPopConfirm/MyPopConfirm";
//
import { checkLoginState } from "./reducer/modules/user";
//
import "./styles/App.scss";
import "./styles/antd-ui/theme.less";
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
  const showConfirm = (msg, callback) => {
    // 自定义 window.confirm
    // http://reacttraining.cn/web/api/BrowserRouter/getUserConfirmation-func
    let container = document.createElement("div");
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(<MyPopConfirm msg={msg} callback={callback}/>);
  };
  //
  return (
    <Router getUserConfirmation={showConfirm}>
      <Layout {...props}>
        {Object.keys(AppRoute).map((key) => {
          let item = AppRoute[key];
          return ["login", "home"].includes(key) ? (
            <Route key={key} exact path={item.path} component={item.component}/>
          ) : (
            <Route key={key} path={item.path} component={requireAuthentication(item.component)}/>
          );
        })}
      </Layout>
    </Router>
  )
}
export default connect(
  (state) => ({
    isLogin: state.user.isLogin,
    loginState: state.user.loginState ?? 1,
    curUserRole: state.user.role
  }),
  {
    checkLoginState
  }
)(App)
