import React, { useEffect } from "react";

function Layout(props) {
  useEffect(() => {
    console.log("layout挂载中");
  }, [])
  return (
    <div>{props.children}</div>
  )
}
export default Layout
