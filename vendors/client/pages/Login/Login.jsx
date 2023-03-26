import React, { PureComponent as Component } from "react";
import LoginWrap from "./components/LoginWrap";
import { Row, Col, Card } from "antd";
import LogoSVG from "../../components/LogoSVG/LogoSVG.jsx";
import styles from "./Login.module.scss";

class Login extends Component {
  render() {
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
            <Row type="flex" justify="center">
              <Col xs={20} sm={16} md={12} lg={8} className="container-login">
                <Card className="card-login">
                  <h2 className="login-title">YAPI</h2>
                  <div className="login-logo">
                    <LogoSVG length="100px"/>
                  </div>
                  <LoginWrap/>
                </Card>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }
}
export default Login;
