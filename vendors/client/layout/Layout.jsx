import React, { useEffect, useState } from "react";
import Loading from "../components/Loading/Loading";
import Notify from "../components/Notify/Notify";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { Alert } from "antd";
//
import styles from "./Layout.module.scss";

/**
 * 非 Chrome 浏览器提示（接口测试等功能依赖 Chrome）
 */
function AlertContent() {
  const ua = window.navigator.userAgent;
  const isChrome = ua.indexOf("Chrome") > -1 && window.chrome;
  if (!isChrome) {
    return (
      <Alert
        style={{ zIndex: 99 }}
        message={"YApi 的接口测试等功能仅支持 Chrome 浏览器，请使用 Chrome 浏览器获得完整功能。"}
        banner
        closable
      />
    );
  }
  return null;
}

/**
 * 全局布局：登录态检查完成后关闭 Loading，避免固定 1 秒等待
 */
function Layout(props) {
  console.debug("layout =>", props);
  const { loginState, curUserRole, checkLoginState } = props;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await checkLoginState();
        console.log("layout挂载中", loginState);
      } catch (err) {
        console.error("layout 登录态检查失败", err);
      } finally {
        if (!cancelled) {
          setVisible(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.Main}>
      <Loading visible={visible}/>
      {curUserRole === "admin" && <Notify/>}
      <AlertContent/>
      {loginState !== 0 ? <Header/> : null}
      {props.children}
      <Footer/>
    </div>
  );
}
export default Layout;
