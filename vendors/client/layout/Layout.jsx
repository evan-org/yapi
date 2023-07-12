import React, { useEffect, useState } from "react";
// import Loading from "../components/Loading/Loading.jsx";
// import AppFooter from "@/pages/Home/components/Footer/Footer.jsx";
import AppHeader from "./components/Header/Header.jsx";
//
import styles from "./Layout.module.scss";
import { Container, Alert, Toolbar } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
function Layout(props) {
  console.debug("layout =>", props);
  //
  const { loginState, checkLoginState, isLogin } = props;
  const [visible, setVisible] = useState(true);
  const [compute, setCompute] = useState("");
  const location = useLocation();
  //
  useEffect(() => {
    checkLoginStatus();
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
  //
  return (
    <div className={styles.Layout}>
      {isLogin ? <AppHeader {...props}/> : null}
      <Container mode={"section"} className={[styles.LayoutContainer, compute].join(" ")} maxWidth={false} sx={{ padding: 0 }}>
        <Outlet/>
      </Container>
      <AlertContent/>
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
