import React, { lazy, Suspense } from "react";
import { APP_NAME } from "@/utils/config";
import Loading from "@/components/Loading/Loading.jsx";
import { useRoutes } from "react-router-dom";
//
/*
* let routers = {
      interface: { name: "接口", path: "/project/:id/interface/:action", component: Interface },
      activity: { name: "动态", path: "/project/:id/activity", component: Activity },
      data: { name: "数据管理", path: "/project/:id/data", component: Data },
      members: { name: "成员管理", path: "/project/:id/members", component: Members },
      setting: { name: "设置", path: "/project/:id/setting", component: Setting }
    };*/
//
// import Layout from "../layout/Layout.jsx";
// import Home from "../pages/Home/Home.jsx";
const router = [
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
        meta: { title: "我的项目组", auth: true },
        children: [
          {
            path: ":groupId",
            name: "Group",
            element: lazy(() => import("@/pages/Group/Group.jsx")),
            meta: { title: "我的项目组", auth: true }
          }
        ]
      },
      //
      {
        path: "/user",
        name: "User",
        element: lazy(() => import("../pages/User/User.jsx")),
        meta: { title: "个人中心", auth: true },
        children: [
          {
            index: true,
            element: lazy(() => import("../pages/Error/NotFound/NotFound.jsx")),
            meta: { title: "加载中", auth: false },
          },
          {
            path: "profile/:uid",
            name: "UserProfile",
            element: lazy(() => import("../pages/User/Profile/Profile.jsx")),
            meta: { title: "个人中心", auth: true }
          },
          {
            path: "list",
            name: "UserList",
            element: lazy(() => import("../pages/User/List/List.jsx")),
            meta: { title: "个人中心", auth: true }
          }
        ]
      },
      //
      {
        path: "/project",
        name: "Project",
        element: lazy(() => import("../pages/Project/Project.jsx")),
        meta: { title: "查看报告", auth: true },
        children: [
          {
            path: ":id",
            name: "Project",
            element: lazy(() => import("../pages/Project/Project.jsx")),
            meta: { title: "查看报告", auth: true },
          },
          {
            path: "interface",
            name: "ProjectInterface",
            element: lazy(() => import("../pages/Project/Interface/Interface.jsx")),
            meta: { title: "接口", auth: true },
            children: [
              {
                path: ":action",
                name: "ProjectInterface",
                element: lazy(() => import("../pages/Project/Interface/Interface.jsx")),
                meta: { title: "接口", auth: true },
              }
            ]
          },
          {
            path: "activity",
            name: "ProjectActivity",
            element: lazy(() => import("../pages/Project/Activity/Activity.jsx")),
            meta: { title: "动态", auth: true }
          },
          {
            path: "data",
            name: "ProjectData",
            element: lazy(() => import("../pages/Project/Data/Data.jsx")),
            meta: { title: "数据管理", auth: true }
          },
          {
            path: "members",
            name: "ProjectData",
            element: lazy(() => import("@/pages/Project/Members/Members.jsx")),
            meta: { title: "成员管理", auth: true }
          },
          {
            path: "setting",
            name: "ProjectSetting",
            element: lazy(() => import("../pages/Project/Setting/Setting.jsx")),
            meta: { title: "设置", auth: true }
          }
        ]
      },
      //
      {
        path: "/follow",
        name: "Follow",
        element: lazy(() => import("../pages/Follow/Follow.jsx")),
        meta: { title: "查看报告", auth: true }
      },
      //
      {
        path: "/statistic",
        name: "Statistic",
        element: lazy(() => import("../pages/Statistic/Statistic.jsx")),
        meta: { title: "系统信息", auth: true }
      }
    ]
  },
  {
    path: "/login",
    element: lazy(() => import("../pages/Login/Login.jsx")),
    meta: { title: "登录", auth: false },
  },
  {
    path: "/webview",
    element: lazy(() => import("../pages/Webview/Webview.jsx")),
    meta: { title: APP_NAME, auth: false },
  },
  {
    path: "*",
    element: lazy(() => import("../pages/Error/NotFound/NotFound.jsx")),
    meta: { title: "什么也没找到", auth: false },
  }
];
const plugin = require("@/plugin.js");
// 增加路由钩子
plugin.emitHook("app_route", router);
// routes
console.log("111111", router);
// import MainRoutes from "./MainRoutes";
// import AuthenticationRoutes from "./AuthenticationRoutes";
// ==============================|| ROUTING RENDER ||============================== //
export default function ThemeRoutes() {
  return useRoutes([...router]);
}
// 路由处理方式
const generateRouter = (routers) => routers.map((Item) => {
  if (Item.children) {
    Item.children = generateRouter(Item.children)
  }
  /* 补充meta，仿照vue router */
  if (!Item.meta) {
    Item.meta = { title: APP_NAME, auth: false };
  }
  /* 把懒加载的异步路由变成组件装载进去 */
  if (Item.element) {
    const meta = Item.meta ? Item.meta : { title: APP_NAME, auth: false };
    // console.log(item);
    Item.element = <Suspense fallback={<Loading visible/>}>
      <Item.element meta={meta}/>
    </Suspense>
  }
  return Item
})
// 组成路由
const asyncRouter = generateRouter(router);
//
export const routes = () => useRoutes([...asyncRouter]);
