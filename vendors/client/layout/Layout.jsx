import React, { useEffect, useState } from "react";
import Loading from "../components/Loading/Loading";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Alert } from "antd";
//
import styles from "./Layout.module.scss";
import { Container } from "@mui/material";
import { Outlet, useLocation } from "react-router-dom";
import { connect } from "react-redux";
import { checkLoginState } from "@/reducer/modules/user";

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
    <section className={styles.Layout}>
      <Loading visible={visible}/>
      {loginState === 2 ? <Header {...props}/> : null}
      <Container class={[styles.LayoutContainer, compute].join(" ")} maxWidth={false} sx={{ padding: 0 }}>
        <Outlet/>
      </Container>
      <Footer/>
      <AlertContent/>
    </section>
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
