import React from "react";
import type { Metadata } from "next";
import "./globals.css";
//
import AntdProvider from "@/context/AntdProvider";
import AuthProvider from "@/context/AuthProvider";
import StoreProvider from "@/context/StoreProvider.tsx";
//
import LoginBtn from '@/components/auth/login-btn.js';

export const metadata: Metadata = {
  title: "YApi-高效、易用、功能强大的可视化接口管理平台",
  description: "YApi 是高效、易用、功能强大的 api 管理平台，旨在为开发、产品、测试人员提供更优雅的接口管理服务。可以帮助开发者轻松创建、发布、维护 API，YApi 还为用户提供了优秀的交互体验，开发人员只需利用平台提供的接口数据写入工具以及简单的点击操作就可以实现接口的管理",
  keywords: 'yapi接口管理,api管理,接口管理,api,接口,接口文档,api文档,接口管理系统',
  applicationName: "YApi",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};
export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
    <head>
      <meta id="cross-request-sign" charSet="utf-8"/>
      <meta name="theme-color" content="#FFFFFF"/>
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
    </head>
    <body>
      <StoreProvider>
        <AuthProvider>
          <AntdProvider>
            {children}
          </AntdProvider>
        </AuthProvider>
      </StoreProvider>
    </body>
    </html>
  );
}
