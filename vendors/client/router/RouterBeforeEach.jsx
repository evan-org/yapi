import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { checkRouterAuth } from "./index.js";
import React, { useEffect, useState } from "react";
import { changeMeta } from "@/store/action/appAction.ts";
function RouterBeforeEach() {
  const location = useLocation();
  const navigate = useNavigate();
  //
  const [auth, setAuth] = useState(false);
  //
  useEffect(() => {
    let obj = checkRouterAuth(location.pathname);
    console.log(obj);
    if (obj && obj.auth) {
      setAuth(obj.auth);
      // navigate('/', { replace: true })
    } else {
      setAuth(true);
    }
  }, [location]);
  return (auth ? <Outlet/> : null)
}

export default RouterBeforeEach
