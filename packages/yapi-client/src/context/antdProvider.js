"use client";
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import { useAppSelector } from "@/store/hooks.js";
import { useEffect } from "react";

export default function AntdProvider({ children }) {
  const { myTheme, defaultTheme, darkTheme } = useAppSelector(state => state.system)
  useEffect(() => {
    if (myTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [myTheme])
  return <AntdRegistry>
    <ConfigProvider locale={zhCN} theme={{
      token: {
        colorPrimary: myTheme === 'dark' ? darkTheme.primary : defaultTheme.primary
      },
      algorithm: myTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm
    }}>
      <div>
        {children}
      </div>
    </ConfigProvider>
  </AntdRegistry>
}
