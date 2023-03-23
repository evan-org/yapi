import React from "react";
import styles from "styles.module.scss";

function Main(props) {
  return (
    <div className={styles.Main}>{props.childen}</div>
  )
}
export default Main;
