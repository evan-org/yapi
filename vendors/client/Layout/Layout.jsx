import React, { useEffect, useState } from "react";
import AppHeader from "./components/Header/Header.jsx";
//
import { Layout } from "antd";
import styles from "./Layout.module.scss";
import { Alert } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { checkLoginState } from "@/reducer/modules/user.js";
//
function AlertContent() {
  const ua = window.navigator.userAgent,
    isChrome = ua.indexOf("Chrome") && window.chrome;
  if (!isChrome) {
    return (
      <Alert
        style={{ zIndex: 99 }}
        message={"YApi 的接口测试等功能仅支持 Chrome 浏览器，请使用 Chrome 浏览器获得完整功能。"}
        banner
        closable
      />
    );
  } else {
    return null
  }
}
//
function Main(props) {
  console.debug("Layout =>", props);
  //
  const { loginState, checkLoginState, isLogin } = props;
  const [visible, setVisible] = useState(true);
  const [compute, setCompute] = useState("");
  const location = useLocation();
  //
  useEffect(() => {
    void checkLoginStatus();
  }, []);
  //
  const checkLoginStatus = async() => {
    try {
      const loginData = await checkLoginState();
      console.log("layout挂载中", loginData, props);
      setTimeout(() => {
        setVisible(false);
      }, 1000)
    } catch (e) {
      console.log("checkLoginStatus >>>>>>>>>>>>>", e);
    }
  }
  //
  useEffect(() => {
    console.log("location update", location);
    if (["", "/", "/login"].includes(location.pathname)) {
      setCompute(() => styles.compute);
    }
  }, [location])
  return (
    <Layout className={styles.Layout}>
      {
        loginState ? <AppHeader {...props}/> : null
      }
      <Outlet/>
      <AlertContent/>
    </Layout>
  )
}
//
export default connect(
  (state) => ({
    isLogin: state.user.isLogin,
    loginState: state.user.loginState ?? 1,
    curUserRole: state.user.role
  }),
  {
    checkLoginState
  }
)(Main);
