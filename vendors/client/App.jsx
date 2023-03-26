import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { connect } from "react-redux";
import { Route, BrowserRouter as Router } from "react-router-dom";
import { Home, Group, Project, Follows, AddProject, Login } from "./containers/index";
//
import Layout from "./layout/Layout";
//
import User from "./containers/User/User.jsx";
import MyPopConfirm from "./components/MyPopConfirm/MyPopConfirm";
//
import { checkLoginState } from "./reducer/modules/user";
import { requireAuthentication } from "./components/AuthenticatedComponent";
//
import "./styles/App.scss";
//
import "./styles/antd-ui/theme.less";

const plugin = require("client/plugin.js");
const LOADING_STATUS = 0;
//
const AppRoute = {
  home: {
    path: "/",
    component: Home
  },
  login: {
    path: "/login",
    component: Login
  },
  group: {
    path: "/group",
    component: Group
  },
  project: {
    path: "/project/:id",
    component: Project
  },
  user: {
    path: "/user",
    component: User
  },
  follow: {
    path: "/follow",
    component: Follows
  },
  addProject: {
    path: "/add-project",
    component: AddProject
  }
};
// 增加路由钩子
plugin.emitHook("app_route", AppRoute);
function App(props) {
  console.log(process.env);
  //
  useEffect(() => {
    checkLoginState();
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
        <div className="app-container">
          {Object.keys(AppRoute).map((key) => {
            let item = AppRoute[key];
            return ["login", "home"].includes(key) ? (
              <Route key={key} exact path={item.path} component={item.component}/>
            ) : (
              <Route key={key} path={item.path} component={requireAuthentication(item.component)}/>
            );
          })}
        </div>
      </Layout>
    </Router>
  )
}
export default connect(
  (state) => ({
    loginState: state.user.loginState ?? 1,
    curUserRole: state.user.role
  }),
  {
    checkLoginState
  }
)(App)
