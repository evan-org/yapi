import React from "react";
import LoginWrap from "./components/LoginWrap";
import { Row, Col, Card } from "antd";
import LogoSVG from "../../components/LogoSVG/LogoSVG";
import styles from "./Login.module.scss";

function Login(props) {
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
        <div className="container">
          <Card className="card-login">
            <div className="login-logo">
              <LogoSVG length="100px"/>
            </div>
            <h2 className="login-title">YAPI</h2>
            <LoginWrap {...props}/>
          </Card>
        </div>
      </div>
    </div>
  );
}
export default Login;
