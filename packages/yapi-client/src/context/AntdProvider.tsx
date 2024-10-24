"use client";
import React, { useEffect } from "react";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN.js";
import "dayjs/locale/zh-cn.js";
import { useAppSelector } from "@/store/hooks.ts";

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  const { myTheme, defaultTheme, darkTheme } = useAppSelector((state: any) => state.system)
  useEffect(() => {
    if (myTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [myTheme])
  return (
    <AntdRegistry>
      <ConfigProvider locale={zhCN} theme={{
        token: {
          colorPrimary: myTheme === "dark" ? darkTheme.primary : defaultTheme.primary
        },
        algorithm: myTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm
      }}>
        <div className={"__antd_registry__config_provider__main__"}>
          {children}
        </div>
      </ConfigProvider>
    </AntdRegistry>
  )
}
