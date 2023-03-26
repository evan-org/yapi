import React, { useEffect, useState } from "react";
import Loading from "../components/Loading/Loading";
import Notify from "../components/Notify/Notify";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Alert } from "antd";
//
import styles from "./Layout.module.scss";

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
  const { loginState, curUserRole, checkLoginState } = props;
  const [visible, setVisible] = useState(true);
  //
  useEffect(() => {
    (async() => {
      const a = await checkLoginState();
      console.log("layout挂载中", loginState, a);
      setTimeout(() => {
        setVisible(false);
      }, 1000)
    })()
  }, [])
  return (
    <div className={styles.Main}>
      <Loading visible={visible}/>
      {curUserRole === "admin" && <Notify/>}
      <AlertContent/>
      {loginState !== 0 ? <Header/> : null}
      {/**/}
      {props.children}
      <Footer/>
    </div>
  )
}
export default Layout;
