"use client";
import React from "react";
import LoginContainer from "./components/LoginContainer.jsx";
import LogoSVG from "@/components/LogoSVG/LogoSVG.jsx";
import styles from "./index.module.scss";
import { Card } from "antd";

function Login(props: any) {
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
        <Card style={{ width: 440, background: "#fff", padding: "20px" }}>
          <div className="card-login">
            <div className="login-logo">
              <LogoSVG length="100px"/>
            </div>
            <h2 className="login-title">YAPI</h2>
            <LoginContainer {...props}/>
          </div>
        </Card>
      </div>
    </div>
  );
}
export default Login;
