import React, {useEffect} from "react";
//
function Main() {
  useEffect(() => {
    console.error("err404");
  }, []);
  return (
    <div>404</div>
  );
}
export default Main;
