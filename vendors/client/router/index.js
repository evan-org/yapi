import React, { Suspense, lazy } from "react";
import { useRoutes } from "react-router-dom";
import { APP_NAME } from "@/utils/config";
import Loading from "@/components/loading/Loading.jsx";
//
const routes = [
  {
    path: "/",
    element: lazy(() => import("../layout/Layout.jsx")),
    children: [
      {
        index: true,
        element: lazy(() => import("../pages/Home/Home.jsx")),
        meta: { title: APP_NAME, auth: false },
      },
      //
      {
        path: "/group",
        name: "Group",
        element: lazy(() => import("../pages/Group/Group.jsx")),
        meta: { title: "查看报告", auth: true }
      },
      //
      {
        path: "/project/:id",
        name: "Project",
        element: lazy(() => import("../pages/Project/Project.jsx")),
        meta: { title: "查看报告", auth: true }
      },
      //
      {
        path: "/add-project",
        name: "AddProject",
        element: lazy(() => import("../pages/AddProject/AddProject.jsx")),
        meta: { title: "查看报告", auth: true }
      },
      //
      {
        path: "/user",
        name: "User",
        element: lazy(() => import("../pages/User/User.jsx")),
        meta: { title: "查看报告", auth: true }
      },
      //
      {
        path: "/follow",
        name: "Follow",
        element: lazy(() => import("../pages/Follow/Follow.jsx")),
        meta: { title: "查看报告", auth: true }
      }
    ]
  },
  // 重定向
  { path: "/home", redirectTo: "/" },
  {
    path: "/login",
    element: lazy(() => import("../pages/Login/Login")),
    meta: { title: "登录", auth: false },
  },
  {
    path: "/webview",
    element: lazy(() => import("../pages/Webview/Webview")),
    meta: { title: APP_NAME, auth: false },
  },
  {
    path: "*",
    element: lazy(() => import("../pages/Error/NotFound/NotFound")),
    meta: { title: "什么也没找到", auth: false },
  }
];
// 根据路径获取路由
const checkAuth = (routers, path) => {
  for (const data of routers) {
    if (data.path === path) {
      return data
    }
    if (data.children) {
      const res = checkAuth(data.children, path)
      if (res) {
        return res
      }
    }
  }
  return null
}
// 路由处理方式
const generateRouter = (routers) => routers.map((item) => {
  if (item.children) {
    item.children = generateRouter(item.children)
  }
  /* 补充meta，仿照vue router */
  if (!item.meta) {
    item.meta = {title: APP_NAME, auth: false};
  }
  /* 把懒加载的异步路由变成组件装载进去 */
  if (item.element) {
    const meta = item.meta ? item.meta : {title: APP_NAME, auth: false};
    // console.log(item);
    item.element = <Suspense fallback={<Loading/>}>
      <item.element meta={meta}/>
    </Suspense>
  }
  return item
})
// 组成路由
const asyncRouter = generateRouter(routes);
//
export const Routes = () => useRoutes(asyncRouter);
//
export const checkRouterAuth = (path) => {
  let auth;
  auth = checkAuth(asyncRouter, path)
  return auth;
}
//
export default { Routes, checkRouterAuth };
