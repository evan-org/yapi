"use client";
import React, { useEffect, useState } from "react";
import LogoSVG from "@/components/LogoSVG/LogoSVG.jsx";
import styles from "./index.module.scss";
import { Card, Tabs } from "antd";
//
import LoginForm from "@/app/login/components/LoginForm.tsx";
import RegForm from "@/app/login/components/RegForm.tsx";
//
import { useAppSelector } from "@/store/hooks.ts";

const TabPane = Tabs.TabPane;
//
function RegisterView() {
  const userState = useAppSelector((state: any) => state.user);
  const canRegister = userState?.can_reg;
  return canRegister ? <RegForm/> : <div style={{ minHeight: 200 }}>管理员已禁止注册，请联系管理员</div>
}
const items = [
  { label: "登录", key: "1", children: <LoginForm/> },
  { label: "注册", key: "2", children: <RegisterView/> },
];
//
function Login() {
  const [activeKey, setActiveKey] = useState("1");
  const userState = useAppSelector((state: any) => state.user);
  const canRegister = userState?.can_reg;
  //
  useEffect(() => {
  }, []);
  //
  return (
    <div className={styles.Login}>
      <div className="m-bg">
        <div className="m-bg-mask m-bg-mask0"/>
        <div className="m-bg-mask m-bg-mask1"/>
        <div className="m-bg-mask m-bg-mask2"/>
        <div className="m-bg-mask m-bg-mask3"/>
      </div>
      {/**/}
      <div className="login-container">
        <Card style={{ width: 440, background: "#fff", padding: "20px", marginTop: "34px" }}>
          <div className="card-login">
            <div className="login-logo">
              <LogoSVG length="100px"/>
            </div>
            <h2 className="login-title">YAPI</h2>
            <Tabs activeKey={activeKey}
              centered
              defaultActiveKey={activeKey}
              className="login-form"
              items={items}
              tabBarStyle={{ border: "none" }}>
            </Tabs>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default Login;
