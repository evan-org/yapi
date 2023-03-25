import React from "react";
import "@client/layout/Layout.module.scss";

function Main(props) {
  return (
    <div className="Main">{props.children}</div>
  )
}
export default Main;
