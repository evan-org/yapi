import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Webview.module.less";
import { Toast } from "antd-mobile";
import { replace } from "lodash";

function Main() {
  const location = useLocation();
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  // 初始化
  const _url = new URLSearchParams(location.search).get("url");
  console.log(_url);
  //
  const onMessage = (event) => {
    console.log("1111", event);
    if (event.origin === "https://web.envive.cn" && event.data) {
      const data = JSON.parse(event.data);
      navigate({ pathname: "/envive/recommend", search: `?id=${data.patient_visit_id}` }, { replace: true });
    }
  }
  //
  useEffect(() => {
    if (_url) {
      setUrl(_url);
      //
      window.addEventListener("message", onMessage, false);
      //
    } else {
      Toast.show({
        content: "当前链接失效，无法打开页面", duration: 1000, afterClose: () => {
          history.back();
        }
      })
    }
    return () => {
      window.removeEventListener("message", onMessage);
    }
  }, []);
  //
  return (
    <div className={styles.index}>
      <iframe loading={"lazy"} src={url} onError={(e) => console.log(e)}/>
    </div>
  )
}
//
export default Main;
