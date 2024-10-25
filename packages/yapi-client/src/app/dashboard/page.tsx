"use client"
import React, { useEffect, useState } from "react";
import { Layout } from "antd";
//
const { Content, Sider } = Layout;
//
import GroupList from "./components/GroupList/GroupList.jsx";
import GroupContent from "./components/GroupContent/GroupContent.jsx";

const drawerWidth = 300;
// 这个和其他页面都会传入layout，当其子页面
export default function Pages() {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
  }, [])
  return (
    <Layout>
      <Sider width={drawerWidth} theme={"light"} collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
        <GroupList/>
      </Sider>
      <Layout
        style={{
          padding: "16px",
        }}>
        <Content>
          <GroupContent/>
        </Content>
      </Layout>
    </Layout>
  )
}
