import React from "react";
import { connect } from "react-redux";
import { Tabs } from "antd";
//
import LoginForm from "./LoginForm";
import RegForm from "./RegForm";

const TabPane = Tabs.TabPane;
//
function LoginWrap(props) {
  const { loginWrapActiveKey, canRegister } = props;
  return (
    <Tabs defaultActiveKey={loginWrapActiveKey} className="login-form" tabBarStyle={{ border: "none" }}>
      <TabPane tab="登录" key="1">
        <LoginForm/>
      </TabPane>
      <TabPane tab={"注册"} key="2">
        {canRegister ? <RegForm/> : <div style={{ minHeight: 200 }}>管理员已禁止注册，请联系管理员</div>}
      </TabPane>
    </Tabs>
  )
}
export default connect((state) => ({
  loginWrapActiveKey: state.user.loginWrapActiveKey,
  canRegister: state.user.canRegister
}))(LoginWrap);
