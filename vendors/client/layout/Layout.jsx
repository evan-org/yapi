import React, { useEffect, useState } from "react";
import Loading from "../components/Loading/Loading.jsx";
import AppFooter from "./components/Footer/Footer.jsx";
import AppHeader from "./components/Header/Header.jsx";
//
import styles from "./Layout.module.scss";
import { Container, Alert } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { checkLoginState } from "@/reducer/modules/user";
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
function Layout(props) {
  console.debug("layout =>", props);
  // const {} = useR
  const { loginState, checkLoginState } = props;
  const [visible, setVisible] = useState(true);
  const [compute, setCompute] = useState("");
  const location = useLocation();
  //
  useEffect(() => {
    (async() => {
      const a = await checkLoginState();
      console.log("layout挂载中", loginState, props);
      setTimeout(() => {
        setVisible(false);
      }, 1000)
    })()
  }, []);
  //
  useEffect(() => {
    console.log("location update", location);
    if (!["", "/", "/login"].includes(location.pathname)) {
      setCompute(() => styles.compute);
    }
  }, [location])
  return (
    <div className={styles.Layout}>
      {loginState === 2 ? <AppHeader {...props}/> : null}
      <Container className={[styles.LayoutContainer, compute].join(" ")} maxWidth={false} sx={{ padding: 0 }}>
        <Outlet/>
      </Container>
      {loginState !== 2 ? <AppFooter {...props}/> : null}
      <AlertContent/>
      <Loading visible={visible}/>
    </div>
  )
}
export default connect(
  (state) => ({
    isLogin: state.user.isLogin,
    loginState: state.user.loginState ?? 1,
    curUserRole: state.user.role
  }),
  {
    checkLoginState
  }
)(Layout);
